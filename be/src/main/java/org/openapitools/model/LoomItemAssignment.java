package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.lang.Nullable;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * LoomItemAssignment
 */

@JsonTypeName("loom-item-assignment")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-16T09:40:37.966612300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class LoomItemAssignment {

  private @Nullable String id;

  private String loomId;

  private String itemId;

  private @Nullable String processId;

  /**
   * Gets or Sets status
   */
  public enum StatusEnum {
    QUEUED("QUEUED"),
    
    RUNNING("RUNNING"),
    
    COMPLETED("COMPLETED"),
    
    ABANDONED("ABANDONED");

    private final String value;

    StatusEnum(String value) {
      this.value = value;
    }

    @JsonValue
    public String getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @JsonCreator
    public static StatusEnum fromValue(String value) {
      for (StatusEnum b : StatusEnum.values()) {
        if (b.value.equals(value)) {
          return b;
        }
      }
      throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
  }

  private @Nullable StatusEnum status;

  public LoomItemAssignment() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public LoomItemAssignment(String loomId, String itemId) {
    this.loomId = loomId;
    this.itemId = itemId;
  }

  public LoomItemAssignment id(@Nullable String id) {
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

  public LoomItemAssignment loomId(String loomId) {
    this.loomId = loomId;
    return this;
  }

  /**
   * Get loomId
   * @return loomId
   */
  @NotNull 
  @Schema(name = "loomId", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("loomId")
  public String getLoomId() {
    return loomId;
  }

  @JsonProperty("loomId")
  public void setLoomId(String loomId) {
    this.loomId = loomId;
  }

  public LoomItemAssignment itemId(String itemId) {
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

  public LoomItemAssignment processId(@Nullable String processId) {
    this.processId = processId;
    return this;
  }

  /**
   * Get processId
   * @return processId
   */
  
  @Schema(name = "processId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("processId")
  public @Nullable String getProcessId() {
    return processId;
  }

  @JsonProperty("processId")
  public void setProcessId(@Nullable String processId) {
    this.processId = processId;
  }

  public LoomItemAssignment status(@Nullable StatusEnum status) {
    this.status = status;
    return this;
  }

  /**
   * Get status
   * @return status
   */
  
  @Schema(name = "status", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("status")
  public @Nullable StatusEnum getStatus() {
    return status;
  }

  @JsonProperty("status")
  public void setStatus(@Nullable StatusEnum status) {
    this.status = status;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LoomItemAssignment loomItemAssignment = (LoomItemAssignment) o;
    return Objects.equals(this.id, loomItemAssignment.id) &&
        Objects.equals(this.loomId, loomItemAssignment.loomId) &&
        Objects.equals(this.itemId, loomItemAssignment.itemId) &&
        Objects.equals(this.processId, loomItemAssignment.processId) &&
        Objects.equals(this.status, loomItemAssignment.status);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, loomId, itemId, processId, status);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LoomItemAssignment {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    loomId: ").append(toIndentedString(loomId)).append("\n");
    sb.append("    itemId: ").append(toIndentedString(itemId)).append("\n");
    sb.append("    processId: ").append(toIndentedString(processId)).append("\n");
    sb.append("    status: ").append(toIndentedString(status)).append("\n");
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

