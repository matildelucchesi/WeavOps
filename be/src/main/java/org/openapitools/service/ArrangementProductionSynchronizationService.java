package org.openapitools.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.repository.FabricRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.ProcessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ArrangementProductionSynchronizationService {
    private final ProcessRepository processes;
    private final LoomItemAssignmentRepository assignments;
    private final FabricRepository fabrics;
    private final ItemRepository items;

    public ArrangementProductionSynchronizationService(
            ProcessRepository processes,
            LoomItemAssignmentRepository assignments,
            FabricRepository fabrics,
            ItemRepository items) {
        this.processes = processes;
        this.assignments = assignments;
        this.fabrics = fabrics;
        this.items = items;
    }

    public ItemEntity synchronize(ItemEntity item, ArrangementEntity arrangement) {
        Float pieceLength = arrangement.getPieceLenght();
        Float plannedPieces = arrangement.getPiecesCount();
        if (pieceLength == null
                || !Float.isFinite(pieceLength)
                || pieceLength <= 0
                || plannedPieces == null
                || !Float.isFinite(plannedPieces)
                || plannedPieces <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Numero pezze e lunghezza pezza devono essere maggiori di zero");
        }

        BigDecimal length = new BigDecimal(pieceLength.toString());
        item.setTotalMeters(
                length.multiply(new BigDecimal(plannedPieces.toString())).doubleValue());
        Set<String> processIds = new LinkedHashSet<>();
        List<ProcessEntity> embeddedProcesses =
                item.getProcessing() == null ? List.of() : item.getProcessing();
        for (ProcessEntity process : embeddedProcesses) {
            if (process != null && process.getId() != null) {
                processIds.add(process.getId());
            }
        }
        assignments
                .findByItemId(item.getId())
                .forEach(
                        assignment -> {
                            if (assignment.getProcessId() != null) {
                                processIds.add(assignment.getProcessId());
                            }
                        });

        List<ProcessEntity> updatedProcesses = new ArrayList<>();
        for (String processId : processIds) {
            ProcessEntity process =
                    processes
                            .findById(processId)
                            .orElseThrow(
                                    () ->
                                            new ResponseStatusException(
                                                    HttpStatus.CONFLICT,
                                                    "Processo associato non trovato: "
                                                            + processId));
            synchronizeProcess(process, arrangement, length);
            updatedProcesses.add(processes.save(process));
        }
        if (!processIds.isEmpty()) {
            item.setProcessing(updatedProcesses);
            item.setMetersRun(
                    updatedProcesses.stream()
                            .mapToDouble(
                                    process ->
                                            process.getMetersRun() == null
                                                    ? 0
                                                    : process.getMetersRun())
                            .sum());
        }

        // Correzione retroattiva anche dei totali calcolati delle Tele già registrate.
        fabrics.findByItemId(item.getId())
                .forEach(
                        fabric -> {
                            fabric.setMetersPerPiece(length);
                            fabrics.save(fabric);
                        });
        return items.save(item);
    }

    private void synchronizeProcess(
            ProcessEntity process, ArrangementEntity arrangement, BigDecimal length) {
        Double previousLength = process.getMetersPerPiece();
        Integer totalPieces = process.getTotalPieces();
        if (totalPieces == null
                && previousLength != null
                && Double.isFinite(previousLength)
                && previousLength > 0
                && process.getTotalMeters() != null) {
            double calculatedPieces = Math.ceil(process.getTotalMeters() / previousLength);
            if (!Double.isFinite(calculatedPieces)
                    || calculatedPieces < 0
                    || calculatedPieces > Integer.MAX_VALUE) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Quantità prevista del processo non valida");
            }
            totalPieces = (int) calculatedPieces;
            process.setTotalPieces(totalPieces);
        }
        if ((totalPieces != null && totalPieces < 0)
                || (process.getPiecesRun() != null && process.getPiecesRun() < 0)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Numero pezze del processo non valido");
        }
        if (totalPieces != null) {
            process.setTotalMeters(length.multiply(BigDecimal.valueOf(totalPieces)).doubleValue());
        } else {
            process.setTotalMeters(
                    rescaleLegacyMeters(process.getTotalMeters(), previousLength, length));
        }
        if (process.getPiecesRun() != null) {
            process.setMetersRun(
                    length.multiply(BigDecimal.valueOf(process.getPiecesRun())).doubleValue());
        } else {
            process.setMetersRun(
                    rescaleLegacyMeters(process.getMetersRun(), previousLength, length));
        }
        process.setMetersPerPiece(length.doubleValue());
        process.setMetersToGo(Math.max(process.getTotalMeters() - process.getMetersRun(), 0));
        if (arrangement.getHitsPerDm() != null) {
            process.setItemHitsPerDm(arrangement.getHitsPerDm().doubleValue());
        }
    }

    private double rescaleLegacyMeters(Double meters, Double previousLength, BigDecimal length) {
        if (meters == null || meters == 0) {
            return 0;
        }
        if (previousLength == null || !Double.isFinite(previousLength) || previousLength <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Impossibile correggere i metri di un processo privo di lunghezza pezza e conteggio pezze");
        }
        return meters * length.doubleValue() / previousLength;
    }
}
