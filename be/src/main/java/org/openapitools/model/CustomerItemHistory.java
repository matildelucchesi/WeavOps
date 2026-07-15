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
 * CustomerItemHistory
 */

@JsonTypeName("customer-item-history")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-15T15:46:57.800382600+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class CustomerItemHistory {

  private @Nullable String id;

  private String customerId;

  private String itemId;

  public CustomerItemHistory() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public CustomerItemHistory(String customerId, String itemId) {
    this.customerId = customerId;
    this.itemId = itemId;
  }

  public CustomerItemHistory id(@Nullable String id) {
    this.id = id;
    return this;
  }

  /**
   * Get id
   * @return id
   */
  
  @Schema(name = "id", accessMode = Schema.AccessMode.READ_ONLY, requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("id")
  public @Nullable String getId() {
    return id;
  }

  @JsonProperty("id")
  public void setId(@Nullable String id) {
    this.id = id;
  }

  public CustomerItemHistory customerId(String customerId) {
    this.customerId = customerId;
    return this;
  }

  /**
   * Get customerId
   * @return customerId
   */
  @NotNull 
  @Schema(name = "customerId", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("customerId")
  public String getCustomerId() {
    return customerId;
  }

  @JsonProperty("customerId")
  public void setCustomerId(String customerId) {
    this.customerId = customerId;
  }

  public CustomerItemHistory itemId(String itemId) {
    this.itemId = itemId;
    return this;
  }

  /**
   * Get itemId
   * @return itemId
   */
  @NotNull 
  @Schema(name = "itemId", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("itemId")
  public String getItemId() {
    return itemId;
  }

  @JsonProperty("itemId")
  public void setItemId(String itemId) {
    this.itemId = itemId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CustomerItemHistory customerItemHistory = (CustomerItemHistory) o;
    return Objects.equals(this.id, customerItemHistory.id) &&
        Objects.equals(this.customerId, customerItemHistory.customerId) &&
        Objects.equals(this.itemId, customerItemHistory.itemId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, customerId, itemId);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CustomerItemHistory {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    customerId: ").append(toIndentedString(customerId)).append("\n");
    sb.append("    itemId: ").append(toIndentedString(itemId)).append("\n");
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

