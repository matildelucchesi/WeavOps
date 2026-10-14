package org.openapitools.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "delivery-note-options")
public record DeliveryNoteOption(
        @Id @JsonProperty(access = JsonProperty.Access.READ_ONLY) String id,
        @NotNull Type type,
        @NotBlank @Size(max = 100) String value,
        boolean active) {
    public enum Type {
        TRANSPORT,
        FREIGHT
    }
}
