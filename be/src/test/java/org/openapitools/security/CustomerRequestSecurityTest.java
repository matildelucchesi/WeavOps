package org.openapitools.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.configuration.SecurityConfig;
import org.openapitools.controller.CustomerController;
import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.UserEntity;
import org.openapitools.mapper.CustomerMapper;
import org.openapitools.model.Customer;
import org.openapitools.repository.UserRepository;
import org.openapitools.service.CustomerService;
import org.openapitools.service.MobileTokenAuthorizationService;
import org.openapitools.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CustomerController.class)
@Import(SecurityConfig.class)
@ContextConfiguration(classes = {CustomerController.class, SecurityConfig.class})
class CustomerRequestSecurityTest {
    @Autowired MockMvc mvc;
    @MockBean CustomerService customers;
    @MockBean CustomerMapper mapper;
    @MockBean TokenService tokens;
    @MockBean UserRepository users;
    @MockBean MobileTokenAuthorizationService mobileAuthorization;

    private void authenticate() {
        UserEntity user = new UserEntity();
        user.setId("user");
        user.setUsername("test");
        user.setCredentialVersion(0);
        when(tokens.validateToken("valid-token"))
                .thenReturn(
                        Optional.of(new TokenService.TokenPayload("test", "user", null, null, 0L)));
        when(users.findById("user")).thenReturn(Optional.of(user));
    }

    @Test
    void unauthenticatedCustomerCreationRemainsUnauthorized() throws Exception {
        mvc.perform(post("/customers").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(customers);
    }

    @Test
    void validLongVatCanBeSubmittedByAnAuthenticatedUser() throws Exception {
        authenticate();
        CustomerEntity entity = new CustomerEntity();
        when(mapper.toEntity(any())).thenReturn(entity);
        when(customers.save(entity)).thenReturn(entity);
        when(mapper.toDto(entity))
                .thenReturn(
                        new Customer().name("CLIENTE").email("").vatNumber("IT001234567891234"));
        mvc.perform(
                        post("/customers")
                                .header("Authorization", "Bearer valid-token")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"name\":\"CLIENTE\",\"email\":\"\",\"vatNumber\":\"IT001234567891234\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void invalidCustomerDataReturnsBadRequestInsteadOfUnauthorized() throws Exception {
        authenticate();
        mvc.perform(
                        post("/customers")
                                .header("Authorization", "Bearer valid-token")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"name\":\"CLIENTE\",\"email\":\"\",\"vatNumber\":\"IT-123\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(customers);
    }

    @Test
    void internalErrorDispatchPreservesOriginalStatusWithoutAuthenticatingAgain() throws Exception {
        mvc.perform(
                        get("/error")
                                .with(
                                        request -> {
                                            request.setDispatcherType(DispatcherType.ERROR);
                                            return request;
                                        })
                                .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 400)
                                .requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/customers"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/error")).andExpect(status().isUnauthorized());
    }
}
