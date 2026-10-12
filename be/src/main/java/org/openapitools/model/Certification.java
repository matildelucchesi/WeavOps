package org.openapitools.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Generated;
import jakarta.validation.constraints.*;
import java.util.*;
import java.util.Objects;
import org.springframework.lang.Nullable;

/** Certification */
@JsonTypeName("certification")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-10-09T11:36:46.062469700+02:00[Europe/Rome]",
        comments = "Generator version: 7.23.0")
public class Certification {

    private @Nullable String id;

    private String value;

    private String description;

    public Certification() {
        super();
    }

    /** Constructor with only required parameters */
    public Certification(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public Certification id(@Nullable String id) {
        this.id = id;
        return this;
    }

    /**
     * Identificativo MongoDB generato dal server.
     *
     * @return id
     */
    @Schema(
            name = "id",
            accessMode = Schema.AccessMode.READ_ONLY,
            description = "Identificativo MongoDB generato dal server.",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("id")
    public @Nullable String getId() {
        return id;
    }

    @JsonProperty("id")
    public void setId(@Nullable String id) {
        this.id = id;
    }

    public Certification value(String value) {
        this.value = value;
        return this;
    }

    /**
     * Get value
     *
     * @return value
     */
    @NotNull
    @Size(min = 1)
    @Schema(name = "value", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("value")
    public String getValue() {
        return value;
    }

    @JsonProperty("value")
    public void setValue(String value) {
        this.value = value;
    }

    public Certification description(String description) {
        this.description = description;
        return this;
    }

    /**
     * Get description
     *
     * @return description
     */
    @NotNull
    @Schema(name = "description", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("description")
    public String getDescription() {
        return description;
    }

    @JsonProperty("description")
    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Certification certification = (Certification) o;
        return Objects.equals(this.id, certification.id)
                && Objects.equals(this.value, certification.value)
                && Objects.equals(this.description, certification.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, value, description);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Certification {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    value: ").append(toIndentedString(value)).append("\n");
        sb.append("    description: ").append(toIndentedString(description)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces (except the first
     * line).
     */
    private String toIndentedString(@Nullable Object o) {
        return o == null ? "null" : o.toString().replace("\n", "\n    ");
    }
}
