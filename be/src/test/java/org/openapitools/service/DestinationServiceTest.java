package org.openapitools.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.DestinationEntity;
import org.openapitools.repository.CustomerRepository;
import org.openapitools.repository.DestinationRepository;

class DestinationServiceTest {
    private DestinationRepository repository;
    private CustomerRepository customers;
    private DestinationService service;

    @BeforeEach
    void setup() {
        repository = mock(DestinationRepository.class);
        customers = mock(CustomerRepository.class);
        service = new DestinationService(repository, customers);
        when(repository.save(any(DestinationEntity.class))).thenAnswer(call -> call.getArgument(0));
    }

    private DestinationEntity destination() {
        DestinationEntity entity = new DestinationEntity();
        entity.setName(" Azienda Uno ");
        entity.setStreet(" Via Roma ");
        entity.setStreetNumber(" 12/a ");
        entity.setPostalCode("00100");
        entity.setCity(" Roma ");
        entity.setProvinceCode("rm");
        return entity;
    }

    @Test
    void keepsLeadingPostalCodeZerosAndNormalizesItalianAddress() {
        DestinationEntity saved = service.save(destination());
        assertThat(saved.getName()).isEqualTo("AZIENDA UNO");
        assertThat(saved.getStreet()).isEqualTo("VIA ROMA");
        assertThat(saved.getStreetNumber()).isEqualTo("12/A");
        assertThat(saved.getPostalCode()).isEqualTo("00100");
        assertThat(saved.getProvinceCode()).isEqualTo("RM");
    }

    @Test
    void rejectsInvalidPostalCodeProvinceAndBlankCompanyName() {
        DestinationEntity invalidPostalCode = destination();
        invalidPostalCode.setPostalCode("100");
        assertThatThrownBy(() -> service.save(invalidPostalCode))
                .isInstanceOf(DestinationValidationException.class);
        DestinationEntity invalidProvince = destination();
        invalidProvince.setProvinceCode("Roma");
        assertThatThrownBy(() -> service.save(invalidProvince))
                .isInstanceOf(DestinationValidationException.class);
        DestinationEntity blankName = destination();
        blankName.setName(" ");
        assertThatThrownBy(() -> service.save(blankName))
                .isInstanceOf(DestinationValidationException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void sharedDestinationCannotBeDeletedWhileAssociatedWithCustomers() {
        when(repository.existsById("dest")).thenReturn(true);
        when(customers.existsByDestinationId("dest")).thenReturn(true);
        assertThatThrownBy(() -> service.deleteById("dest"))
                .isInstanceOf(DestinationValidationException.class)
                .hasMessageContaining("rimuovere prima");
        verify(repository, never()).deleteById(any());
    }

    @Test
    void deletingUnassignedDestinationDoesNotModifyOrDeleteCustomers() {
        when(repository.existsById("dest")).thenReturn(true);
        assertThat(service.deleteById("dest")).isTrue();
        verify(repository).deleteById("dest");
        verify(customers, never()).save(any());
        verify(customers, never()).deleteById(any());
    }

    @Test
    void updatePreservesTheSharedDestinationId() {
        when(repository.existsById("dest")).thenReturn(true);
        assertThat(service.update("dest", destination()).orElseThrow().getId()).isEqualTo("dest");
        verifyNoInteractions(customers);
    }
}
