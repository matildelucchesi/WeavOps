package org.openapitools.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.openapitools.model.Customer;

class CustomerAddressMapperTest {
    @Test
    void addressAndLongVatSurviveMappingAndContractValidation() {
        Customer source =
                new Customer()
                        .name("CLIENTE")
                        .email("")
                        .vatNumber("IT001234567891234")
                        .street("Via Roma")
                        .streetNumber("1/A")
                        .postalCode("00100")
                        .city("Roma")
                        .provinceCode("RM");
        CustomerMapper mapper =
                new CustomerMapper(mock(ReferentMapper.class), mock(ItemMapper.class));
        Customer restored = mapper.toDto(mapper.toEntity(source));
        assertThat(restored.getStreet()).isEqualTo(source.getStreet());
        assertThat(restored.getStreetNumber()).isEqualTo(source.getStreetNumber());
        assertThat(restored.getPostalCode()).isEqualTo("00100");
        assertThat(restored.getCity()).isEqualTo("Roma");
        assertThat(restored.getProvinceCode()).isEqualTo("RM");
        assertThat(restored.getVatNumber()).isEqualTo(source.getVatNumber());
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertThat(factory.getValidator().validate(restored)).isEmpty();
        }
    }
}
