package org.openapitools.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class CreateItemWithArrangementRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void deserializesCustomerNameAndArrangement() throws Exception {
        String json = """
                {
                  "customerName": "ACME Srl",
                  "arrangement": {
                    "itemName": "Articolo 100",
                    "reedCount": 20,
                    "reedCM": 100,
                    "reedHight": 1.5,
                    "warpLenght": 200,
                    "piecesCount": 3,
                    "pieceLenght": 50,
                    "warpEndCount": 1200,
                    "hitsPerDm": 25
                  }
                }
                """;

        CreateItemWithArrangementRequest request = objectMapper.readValue(
                json,
                CreateItemWithArrangementRequest.class
        );

        assertThat(request.getCustomerName()).isEqualTo("ACME Srl");
        assertThat(request.getArrangement().getItemName()).isEqualTo("Articolo 100");
        assertThat(request.getArrangement().getReedCount()).isEqualByComparingTo(BigDecimal.valueOf(20));
    }

    @Test
    void rejectsBlankCustomerName() {
        Arrangement arrangement = new Arrangement(
                "Articolo 100",
                BigDecimal.valueOf(20),
                BigDecimal.valueOf(100),
                1.5F,
                200F,
                3F,
                50F,
                1200F,
                BigDecimal.valueOf(25)
        );
        CreateItemWithArrangementRequest request = new CreateItemWithArrangementRequest(" ", arrangement);

        assertThat(validator.validate(request))
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("customerName"));
    }
}
