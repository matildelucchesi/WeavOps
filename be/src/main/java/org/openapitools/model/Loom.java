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
 * Loom
 */

@JsonTypeName("loom")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Loom {

  private @Nullable String id;

  private String serialNumber;

  private Boolean isAssigned = false;

  /**
   * Gets or Sets status
   */
  public enum StatusEnum {
    WORKING("WORKING"),
    
    STOPPED("STOPPED"),
    
    MAINTENANCE("MAINTENANCE");

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

  private StatusEnum status;

  public Loom() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Loom(String serialNumber, StatusEnum status) {
    this.serialNumber = serialNumber;
    this.status = status;
  }

  public Loom id(@Nullable String id) {
    this.id = id;
    return this;
  }

  /**
   * Identificativo MongoDB generato dal server
   * @return id
   */
  
  @Schema(name = "id", accessMode = Schema.AccessMode.READ_ONLY, description = "Identificativo MongoDB generato dal server", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("id")
  public @Nullable String getId() {
    return id;
  }

  @JsonProperty("id")
  public void setId(@Nullable String id) {
    this.id = id;
  }

  public Loom serialNumber(String serialNumber) {
    this.serialNumber = serialNumber;
    return this;
  }

  /**
   * Get serialNumber
   * @return serialNumber
   */
  @NotNull 
  @Schema(name = "serialNumber", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("serialNumber")
  public String getSerialNumber() {
    return serialNumber;
  }

  @JsonProperty("serialNumber")
  public void setSerialNumber(String serialNumber) {
    this.serialNumber = serialNumber;
  }

  public Loom isAssigned(Boolean isAssigned) {
    this.isAssigned = isAssigned;
    return this;
  }

  /**
   * Get isAssigned
   * @return isAssigned
   */
  
  @Schema(name = "isAssigned", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("isAssigned")
  public Boolean getIsAssigned() {
    return isAssigned;
  }

  @JsonProperty("isAssigned")
  public void setIsAssigned(Boolean isAssigned) {
    this.isAssigned = isAssigned;
  }

  public Loom status(StatusEnum status) {
    this.status = status;
    return this;
  }

  /**
   * Get status
   * @return status
   */
  @NotNull 
  @Schema(name = "status", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("status")
  public StatusEnum getStatus() {
    return status;
  }

  @JsonProperty("status")
  public void setStatus(StatusEnum status) {
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
    Loom loom = (Loom) o;
    return Objects.equals(this.id, loom.id) &&
        Objects.equals(this.serialNumber, loom.serialNumber) &&
        Objects.equals(this.isAssigned, loom.isAssigned) &&
        Objects.equals(this.status, loom.status);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, serialNumber, isAssigned, status);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Loom {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    serialNumber: ").append(toIndentedString(serialNumber)).append("\n");
    sb.append("    isAssigned: ").append(toIndentedString(isAssigned)).append("\n");
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

