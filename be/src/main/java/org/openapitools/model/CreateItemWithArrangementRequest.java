package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.openapitools.model.Arrangement;
import org.springframework.lang.Nullable;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * CreateItemWithArrangementRequest
 */

@JsonTypeName("create-item-with-arrangement-request")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-16T09:40:37.966612300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class CreateItemWithArrangementRequest {

  private String customerName;

  private Arrangement arrangement;

  public CreateItemWithArrangementRequest() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public CreateItemWithArrangementRequest(String customerName, Arrangement arrangement) {
    this.customerName = customerName;
    this.arrangement = arrangement;
  }

  public CreateItemWithArrangementRequest customerName(String customerName) {
    this.customerName = customerName;
    return this;
  }

  /**
   * Nome esatto del customer da associare all'item.
   * @return customerName
   */
  @NotNull @Size(min = 1) 
  @Schema(name = "customerName", description = "Nome esatto del customer da associare all'item.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("customerName")
  public String getCustomerName() {
    return customerName;
  }

  @JsonProperty("customerName")
  public void setCustomerName(String customerName) {
    this.customerName = customerName;
  }

  public CreateItemWithArrangementRequest arrangement(Arrangement arrangement) {
    this.arrangement = arrangement;
    return this;
  }

  /**
   * Get arrangement
   * @return arrangement
   */
  @NotNull @Valid 
  @Schema(name = "arrangement", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("arrangement")
  public Arrangement getArrangement() {
    return arrangement;
  }

  @JsonProperty("arrangement")
  public void setArrangement(Arrangement arrangement) {
    this.arrangement = arrangement;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CreateItemWithArrangementRequest createItemWithArrangementRequest = (CreateItemWithArrangementRequest) o;
    return Objects.equals(this.customerName, createItemWithArrangementRequest.customerName) &&
        Objects.equals(this.arrangement, createItemWithArrangementRequest.arrangement);
  }

  @Override
  public int hashCode() {
    return Objects.hash(customerName, arrangement);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CreateItemWithArrangementRequest {\n");
    sb.append("    customerName: ").append(toIndentedString(customerName)).append("\n");
    sb.append("    arrangement: ").append(toIndentedString(arrangement)).append("\n");
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

