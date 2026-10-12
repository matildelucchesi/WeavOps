package org.openapitools.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.openapitools.domain.*;
import org.openapitools.model.Fabric;
import org.openapitools.model.Item;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.CertificationRepository;
import org.openapitools.repository.FabricRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FabricService {
    private final FabricRepository repository;
    private final ArrangementRepository arrangementRepository;
    private final CertificationRepository certificationRepository;

    public FabricService(
            FabricRepository repository,
            ArrangementRepository arrangementRepository,
            CertificationRepository certificationRepository) {
        this.repository = repository;
        this.arrangementRepository = arrangementRepository;
        this.certificationRepository = certificationRepository;
    }

    public List<FabricEntity> findAll(String itemId) {
        return itemId == null ? repository.findAll() : repository.findByItemId(itemId);
    }

    public Optional<FabricEntity> findById(String id) {
        return repository.findById(id);
    }

    public void createFromProduction(
            ItemEntity item,
            ProcessEntity process,
            String code,
            String selectedCertificationId,
            Instant producedAt) {
        if (process.getPiecesRun() == null || process.getPiecesRun() <= 0) {
            return;
        }
        if (repository.findByProcessId(process.getId()).isPresent()) {
            return;
        }
        if (code == null || code.isBlank()) {
            throw badRequest("Inserire il codice Tela prima di terminare la produzione.");
        }
        String normalizedCode = code.trim();
        if (repository.existsByCode(normalizedCode)) {
            throw new FabricValidationException(HttpStatus.CONFLICT, "Codice Tela già utilizzato.");
        }
        ArrangementEntity arrangement =
                arrangementRepository
                        .findById(item.getArrangementId())
                        .orElseThrow(() -> badRequest("Disposizione dell'articolo non trovata."));
        if (arrangement.getPiecesCount() == null
                || !Float.isFinite(arrangement.getPiecesCount())
                || arrangement.getPiecesCount() <= 0
                || arrangement.getPieceLenght() == null
                || !Float.isFinite(arrangement.getPieceLenght())
                || arrangement.getPieceLenght() <= 0) {
            throw badRequest(
                    "La disposizione deve indicare pezze previste e metri per pezza maggiori di zero.");
        }
        if (item.getTotalWeight() == null || item.getTotalWeight().signum() < 0) {
            throw badRequest(
                    "Inserire i pesi di ordito e trama dell'articolo prima di registrare la Tela.");
        }

        FabricEntity fabric = new FabricEntity();
        fabric.setCode(normalizedCode);
        fabric.setProcessId(process.getId());
        fabric.setItemId(item.getId());
        fabric.setPiecesCount(process.getPiecesRun());
        fabric.setMetersPerPiece(new BigDecimal(arrangement.getPieceLenght().toString()));
        fabric.setWeightPerPiece(
                item.getTotalWeight()
                        .divide(
                                new BigDecimal(arrangement.getPiecesCount().toString()),
                                MathContext.DECIMAL128));
        fabric.setProducedAt(producedAt);
        fabric.setStatus(Fabric.StatusEnum.AVAILABLE);

        String certificationId = null;
        if (item.getIsCertified() == Item.IsCertifiedEnum.ALL) {
            certificationId = item.getCertificationId();
            if (certificationId == null || certificationId.isBlank()) {
                throw badRequest("Specificare la certificazione dell'articolo.");
            }
        } else if (item.getIsCertified() == Item.IsCertifiedEnum.PARTIAL
                && selectedCertificationId != null
                && !selectedCertificationId.isBlank()) {
            certificationId = selectedCertificationId;
        }
        if (certificationId != null) {
            CertificationEntity certification =
                    certificationRepository
                            .findById(certificationId)
                            .orElseThrow(() -> badRequest("Certificazione non trovata."));
            fabric.setCertificationId(certification.getId());
            fabric.setCertificationValue(certification.getValue());
        }
        try {
            repository.insert(fabric);
        } catch (DuplicateKeyException exception) {
            throw new FabricValidationException(
                    HttpStatus.CONFLICT, "Codice Tela o processo già registrato.", exception);
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new FabricValidationException(HttpStatus.BAD_REQUEST, message);
    }
}
