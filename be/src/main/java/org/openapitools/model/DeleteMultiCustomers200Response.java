package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.springframework.lang.Nullable;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * DeleteMultiCustomers200Response
 */

@JsonTypeName("deleteMultiCustomers_200_response")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-06-23T17:29:03.911191800+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class DeleteMultiCustomers200Response {

  private @Nullable Integer deletedCount;

  public DeleteMultiCustomers200Response deletedCount(@Nullable Integer deletedCount) {
    this.deletedCount = deletedCount;
    return this;
  }

  /**
   * Numero di clienti eliminati
   * @return deletedCount
   */
  
  @Schema(name = "deletedCount", description = "Numero di clienti eliminati", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
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
    DeleteMultiCustomers200Response deleteMultiCustomers200Response = (DeleteMultiCustomers200Response) o;
    return Objects.equals(this.deletedCount, deleteMultiCustomers200Response.deletedCount);
  }

  @Override
  public int hashCode() {
    return Objects.hash(deletedCount);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class DeleteMultiCustomers200Response {\n");
    sb.append("    deletedCount: ").append(toIndentedString(deletedCount)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(@Nullable Object o) {
    return o == null ? "null" : o.toString().replace("\n", "\n    ");
  }
}

