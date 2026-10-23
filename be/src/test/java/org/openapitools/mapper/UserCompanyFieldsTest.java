package org.openapitools.mapper;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.openapitools.model.User;

class UserCompanyFieldsTest {
    @Test
    void companyFieldsSurviveMappingBetweenApiAndDatabase() {
        User user = new User("user", "");
        user.setCompanyName("Azienda");
        user.setVatNumber("IT123456789");
        user.setFiscalCode("12345678901");
        UserMapper mapper = new UserMapper();
        User mapped = mapper.toDto(mapper.toEntity(user));
        assertEquals("Azienda", mapped.getCompanyName());
        assertEquals("IT123456789", mapped.getVatNumber());
        assertEquals("12345678901", mapped.getFiscalCode());
    }
}
