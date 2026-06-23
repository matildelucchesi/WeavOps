package org.openapitools.repository;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class CustomerRepositoryTest {

    @Test
    void exposesFindByNameQueryMethod() throws NoSuchMethodException {
        Method method = CustomerRepository.class.getMethod("findByName", String.class);

        assertThat(method.getReturnType()).isEqualTo(Optional.class);
    }
}
