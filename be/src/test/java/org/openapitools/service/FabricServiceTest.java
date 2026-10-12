package org.openapitools.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.openapitools.domain.*;
import org.openapitools.model.Fabric;
import org.openapitools.model.Item;
import org.openapitools.repository.*;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.server.ResponseStatusException;

class FabricServiceTest {
    private FabricRepository repository;
    private ArrangementRepository arrangements;
    private CertificationRepository certifications;
    private FabricService service;
    private ItemEntity item;
    private ProcessEntity process;
    private ArrangementEntity arrangement;
    private static final Instant PRODUCED_AT = Instant.parse("2026-10-09T12:00:00Z");

    @BeforeEach
    void setup() {
        repository = mock(FabricRepository.class);
        arrangements = mock(ArrangementRepository.class);
        certifications = mock(CertificationRepository.class);
        service = new FabricService(repository, arrangements, certifications);
        item = new ItemEntity();
        item.setId("item");
        item.setArrangementId("arrangement");
        item.setWarpWeight(new BigDecimal("100.5"));
        item.setWeftWeight(new BigDecimal("19.5"));
        process = new ProcessEntity();
        process.setId("process");
        process.setPiecesRun(3);
        process.setMetersPerPiece(999d); // The source must be the article's arrangement.
        arrangement = new ArrangementEntity();
        arrangement.setPieceLenght(12.5f);
        arrangement.setPiecesCount(10f);
        when(arrangements.findById("arrangement")).thenReturn(Optional.of(arrangement));
    }

    @Test
    void snapshotsArticleValuesAndCalculatesBothTotalsFromProducedPieces() {
        service.createFromProduction(item, process, " TELA-1 ", null, PRODUCED_AT);
        ArgumentCaptor<FabricEntity> value = ArgumentCaptor.forClass(FabricEntity.class);
        verify(repository).insert(value.capture());
        FabricEntity fabric = value.getValue();
        assertThat(fabric.getCode()).isEqualTo("TELA-1");
        assertThat(fabric.getItemId()).isEqualTo("item");
        assertThat(fabric.getProcessId()).isEqualTo("process");
        assertThat(fabric.getPiecesCount()).isEqualTo(3);
        assertThat(fabric.getWeightPerPiece()).isEqualByComparingTo("12");
        assertThat(fabric.getTotalMeters()).isEqualByComparingTo("37.5");
        assertThat(fabric.getTotalWeight()).isEqualByComparingTo("36");
        assertThat(fabric.getStatus()).isEqualTo(Fabric.StatusEnum.AVAILABLE);
        assertThat(fabric.getProducedAt()).isEqualTo(PRODUCED_AT);
        item.setWarpWeight(new BigDecimal("500"));
        arrangement.setPieceLenght(50f);
        assertThat(fabric.getTotalWeight()).isEqualByComparingTo("36");
        assertThat(fabric.getTotalMeters()).isEqualByComparingTo("37.5");
    }

    @Test
    void zeroProducedPiecesDoNotRequireACodeOrGenerateAFabric() {
        process.setPiecesRun(0);
        service.createFromProduction(item, process, null, null, PRODUCED_AT);
        verifyNoInteractions(repository, arrangements, certifications);
    }

    @Test
    void retryDoesNotCreateAnotherFabricForTheSameProcess() {
        when(repository.findByProcessId("process")).thenReturn(Optional.of(new FabricEntity()));
        service.createFromProduction(item, process, "other", null, PRODUCED_AT);
        verify(repository, never()).insert(any(FabricEntity.class));
    }

    @Test
    void refusesMissingCodeDuplicateCodeAndMissingArticleWeights() {
        assertThatThrownBy(
                        () -> service.createFromProduction(item, process, " ", null, PRODUCED_AT))
                .isInstanceOf(ResponseStatusException.class);
        when(repository.existsByCode("DUP")).thenReturn(true);
        assertThatThrownBy(
                        () -> service.createFromProduction(item, process, "DUP", null, PRODUCED_AT))
                .isInstanceOf(ResponseStatusException.class);
        item.setWarpWeight(null);
        assertThatThrownBy(
                        () -> service.createFromProduction(item, process, "NEW", null, PRODUCED_AT))
                .isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).insert(any(FabricEntity.class));
    }

    @Test
    void allCertifiedInheritsArticleCertificationAndIgnoresSubmittedOverride() {
        item.setIsCertified(Item.IsCertifiedEnum.ALL);
        item.setCertificationId("GRS");
        CertificationEntity grs = new CertificationEntity();
        grs.setId("GRS");
        grs.setValue("GRS");
        when(certifications.findById("GRS")).thenReturn(Optional.of(grs));
        service.createFromProduction(item, process, "F", "GOTS", PRODUCED_AT);
        ArgumentCaptor<FabricEntity> value = ArgumentCaptor.forClass(FabricEntity.class);
        verify(repository).insert(value.capture());
        assertThat(value.getValue().getCertificationId()).isEqualTo("GRS");
        assertThat(value.getValue().getCertificationValue()).isEqualTo("GRS");
        verify(certifications, never()).findById("GOTS");
    }

    @Test
    void partialAllowsASelectedCertificationOrAnUncertifiedFabric() {
        item.setIsCertified(Item.IsCertifiedEnum.PARTIAL);
        CertificationEntity gots = new CertificationEntity();
        gots.setId("GOTS");
        gots.setValue("GOTS");
        when(certifications.findById("GOTS")).thenReturn(Optional.of(gots));
        service.createFromProduction(item, process, "F1", "GOTS", PRODUCED_AT);
        service.createFromProduction(item, process, "F2", null, PRODUCED_AT);
        ArgumentCaptor<FabricEntity> values = ArgumentCaptor.forClass(FabricEntity.class);
        verify(repository, times(2)).insert(values.capture());
        assertThat(values.getAllValues().get(0).getCertificationValue()).isEqualTo("GOTS");
        assertThat(values.getAllValues().get(1).getCertificationId()).isNull();
    }

    @Test
    void noneCertifiedIgnoresSubmittedCertification() {
        item.setIsCertified(Item.IsCertifiedEnum.NONE);
        service.createFromProduction(item, process, "F", "GRS", PRODUCED_AT);
        verifyNoInteractions(certifications);
        ArgumentCaptor<FabricEntity> value = ArgumentCaptor.forClass(FabricEntity.class);
        verify(repository).insert(value.capture());
        assertThat(value.getValue().getCertificationId()).isNull();
    }

    @Test
    void rejectsUnknownCertificationAndInvalidArrangement() {
        item.setIsCertified(Item.IsCertifiedEnum.PARTIAL);
        assertThatThrownBy(
                        () ->
                                service.createFromProduction(
                                        item, process, "F", "unknown", PRODUCED_AT))
                .isInstanceOf(ResponseStatusException.class);
        arrangement.setPiecesCount(0f);
        assertThatThrownBy(
                        () -> service.createFromProduction(item, process, "F", null, PRODUCED_AT))
                .isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).insert(any(FabricEntity.class));
    }

    @Test
    void concurrentUniqueConstraintViolationReturnsConflict() {
        when(repository.insert(any(FabricEntity.class)))
                .thenThrow(new DuplicateKeyException("duplicate"));
        assertThatThrownBy(
                        () -> service.createFromProduction(item, process, "F", null, PRODUCED_AT))
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
    }
}
