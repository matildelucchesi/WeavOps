package org.openapitools.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.CustomerEntity;
import org.openapitools.repository.CustomerRepository;
import org.openapitools.repository.DestinationRepository;
import org.springframework.test.util.ReflectionTestUtils;

class CustomerDestinationServiceTest {
    private CustomerRepository repository;
    private DestinationRepository destinations;
    private CustomerService service;

    @BeforeEach
    void setup() {
        repository = mock(CustomerRepository.class);
        destinations = mock(DestinationRepository.class);
        service = new CustomerService(repository);
        ReflectionTestUtils.setField(service, "destinationRepository", destinations);
        when(repository.save(any(CustomerEntity.class))).thenAnswer(call -> call.getArgument(0));
    }

    private CustomerEntity customer(String name) {
        CustomerEntity entity = new CustomerEntity();
        entity.setName(name);
        entity.setVatNumber("00123456789");
        return entity;
    }

    @Test
    void destinationCanBeSharedByCustomersAndDuplicateSelectionsAreNormalized() {
        when(destinations.existsById("shared")).thenReturn(true);
        CustomerEntity first = customer("Uno");
        first.setDestinationIds(new ArrayList<>(List.of("shared", " shared ")));
        CustomerEntity second = customer("Due");
        second.setDestinationIds(List.of("shared"));
        service.save(first);
        service.save(second);
        assertThat(first.getDestinationIds()).containsExactly("shared");
        assertThat(second.getDestinationIds()).containsExactly("shared");
        assertThat(first.getVatNumber()).isEqualTo("00123456789");
        first.getDestinationIds().clear();
        assertThat(second.getDestinationIds()).containsExactly("shared");
    }

    @Test
    void cannotSaveOrUpdateCustomerWithoutAnAlphanumericVatNumber() {
        CustomerEntity entity = customer("Uno");
        entity.setVatNumber(null);
        assertThatThrownBy(() -> service.save(entity))
                .isInstanceOf(DestinationValidationException.class);
        when(repository.existsById("customer")).thenReturn(true);
        assertThatThrownBy(() -> service.update("customer", entity))
                .isInstanceOf(DestinationValidationException.class);
        entity.setVatNumber("IT-00123456789");
        assertThatThrownBy(() -> service.save(entity))
                .isInstanceOf(DestinationValidationException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void rejectsReferencesToMissingDestinationsBeforeSaving() {
        CustomerEntity entity = customer("Uno");
        entity.setDestinationIds(List.of("missing"));
        assertThatThrownBy(() -> service.save(entity))
                .isInstanceOf(DestinationValidationException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void acceptsLongAlphanumericVatAndNormalizesCustomerNameAndAddress() {
        CustomerEntity entity = customer(" Azienda italiana ");
        entity.setVatNumber(" IT001234567891234 ");
        entity.setStreet(" Via Roma ");
        entity.setStreetNumber(" 1/a ");
        entity.setPostalCode("00100");
        entity.setCity(" Roma ");
        entity.setProvinceCode("rm");
        CustomerEntity saved = service.save(entity);
        assertThat(saved.getVatNumber()).isEqualTo("IT001234567891234");
        assertThat(saved.getName()).isEqualTo("AZIENDA ITALIANA");
        assertThat(saved.getStreet()).isEqualTo("VIA ROMA");
        assertThat(saved.getStreetNumber()).isEqualTo("1/A");
        assertThat(saved.getPostalCode()).isEqualTo("00100");
        assertThat(saved.getCity()).isEqualTo("ROMA");
        assertThat(saved.getProvinceCode()).isEqualTo("RM");
    }

    @Test
    void rejectsMalformedOptionalItalianAddress() {
        CustomerEntity entity = customer("Uno");
        entity.setPostalCode("123");
        assertThatThrownBy(() -> service.save(entity))
                .isInstanceOf(DestinationValidationException.class);
        entity.setPostalCode("");
        entity.setProvinceCode("Roma");
        assertThatThrownBy(() -> service.save(entity))
                .isInstanceOf(DestinationValidationException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void customerMayHaveNoDestinations() {
        CustomerEntity entity = customer("Uno");
        entity.setDestinationIds(null);
        assertThat(service.save(entity).getDestinationIds()).isEmpty();
        verifyNoInteractions(destinations);
    }

    @Test
    void savesCountryAndAcceptsForeignPostcodesWithoutInventingItaly() {
        CustomerEntity foreign = customer("Estero");
        foreign.setCountry(" Regno Unito ");
        foreign.setPostalCode("SW1A 1AA");
        foreign.setProvinceCode("London");
        CustomerEntity saved = service.save(foreign);
        assertThat(saved.getCountry()).isEqualTo("REGNO UNITO");
        assertThat(saved.getPostalCode()).isEqualTo("SW1A 1AA");
        assertThat(saved.getProvinceCode()).isEqualTo("LONDON");
        assertThat(service.save(customer("Senza paese")).getCountry()).isEmpty();
        CustomerEntity italian = customer("Italiano");
        italian.setCountry("it");
        assertThat(service.save(italian).getCountry()).isEqualTo("ITALIA");
    }
}
