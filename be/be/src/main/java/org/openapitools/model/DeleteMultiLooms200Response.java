package org.openapitools.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Generated;
import jakarta.validation.constraints.*;
import java.util.*;
import java.util.Objects;
import org.springframework.lang.Nullable;

/** DeleteMultiLooms200Response */
@JsonTypeName("deleteMultiLooms_200_response")
@Generated(
        value = "org.openapitools.codegen.languages.SpringCodegen",
        date = "2026-06-19T15:48:41.653649400+02:00[Europe/Rome]",
        comments = "Generator version: 7.22.0")
public class DeleteMultiLooms200Response {

    private @Nullable Integer deletedCount;

    public DeleteMultiLooms200Response deletedCount(@Nullable Integer deletedCount) {
        this.deletedCount = deletedCount;
        return this;
    }

    /**
     * Numero di telai eliminati
     *
     * @return deletedCount
     */
    @Schema(
            name = "deletedCount",
            description = "Numero di telai eliminati",
            requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    @JsonProperty("deletedCount")
    public @Nullable Integer getDeletedCount() {
        return deletedCount;
    }

    @JsonProperty("deletedCount")
    public void setDeletedCount(@Nullable Integer deletedCount) {
        this.deletedCount = deletedCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        DeleteMultiLooms200Response deleteMultiLooms200Response = (DeleteMultiLooms200Response) o;
        return Objects.equals(this.deletedCount, deleteMultiLooms200Response.deletedCount);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deletedCount);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class DeleteMultiLooms200Response {\n");
        sb.append("    deletedCount: ").append(toIndentedString(deletedCount)).append("\n");
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
