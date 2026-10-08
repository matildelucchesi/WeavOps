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
 * LoomLog
 */

@JsonTypeName("loom-log")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class LoomLog {

  private @Nullable String id;

  private String key;

  private @Nullable String loomId;

  private @Nullable String loomCode;

  private @Nullable String loomStatus;

  private @Nullable String itemId;

  private @Nullable String itemName;

  private @Nullable Double metersAdded;

  private @Nullable OffsetDateTime createdAt;

  public LoomLog() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public LoomLog(String key) {
    this.key = key;
  }

  public LoomLog id(@Nullable String id) {
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

  public LoomLog key(String key) {
    this.key = key;
    return this;
  }

  /**
   * Get key
   * @return key
   */
  @NotNull 
  @Schema(name = "key", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("key")
  public String getKey() {
    return key;
  }

  @JsonProperty("key")
  public void setKey(String key) {
    this.key = key;
  }

  public LoomLog loomId(@Nullable String loomId) {
    this.loomId = loomId;
    return this;
  }

  @Schema(name = "loomId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("loomId")
  public @Nullable String getLoomId() {
    return loomId;
  }

  @JsonProperty("loomId")
  public void setLoomId(@Nullable String loomId) {
    this.loomId = loomId;
  }

  public LoomLog loomCode(@Nullable String loomCode) {
    this.loomCode = loomCode;
    return this;
  }

  @Schema(name = "loomCode", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("loomCode")
  public @Nullable String getLoomCode() {
    return loomCode;
  }

  @JsonProperty("loomCode")
  public void setLoomCode(@Nullable String loomCode) {
    this.loomCode = loomCode;
  }

  public LoomLog loomStatus(@Nullable String loomStatus) {
    this.loomStatus = loomStatus;
    return this;
  }

  /**
   * Stato del telaio al momento dell'evento
   * @return loomStatus
   */
  @Schema(name = "loomStatus", description = "Stato del telaio al momento dell'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("loomStatus")
  public @Nullable String getLoomStatus() {
    return loomStatus;
  }

  @JsonProperty("loomStatus")
  public void setLoomStatus(@Nullable String loomStatus) {
    this.loomStatus = loomStatus;
  }

  public LoomLog itemId(@Nullable String itemId) {
    this.itemId = itemId;
    return this;
  }

  @Schema(name = "itemId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("itemId")
  public @Nullable String getItemId() {
    return itemId;
  }

  @JsonProperty("itemId")
  public void setItemId(@Nullable String itemId) {
    this.itemId = itemId;
  }

  public LoomLog itemName(@Nullable String itemName) {
    this.itemName = itemName;
    return this;
  }

  @Schema(name = "itemName", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("itemName")
  public @Nullable String getItemName() {
    return itemName;
  }

  @JsonProperty("itemName")
  public void setItemName(@Nullable String itemName) {
    this.itemName = itemName;
  }

  public LoomLog metersAdded(@Nullable Double metersAdded) {
    this.metersAdded = metersAdded;
    return this;
  }

  @Schema(name = "metersAdded", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("metersAdded")
  public @Nullable Double getMetersAdded() {
    return metersAdded;
  }

  @JsonProperty("metersAdded")
  public void setMetersAdded(@Nullable Double metersAdded) {
    this.metersAdded = metersAdded;
  }

  public LoomLog createdAt(@Nullable OffsetDateTime createdAt) {
    this.createdAt = createdAt;
    return this;
  }

  /**
   * Data e ora di registrazione del log
   * @return createdAt
   */
  @Schema(name = "createdAt", accessMode = Schema.AccessMode.READ_ONLY, description = "Data e ora di registrazione del log", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("createdAt")
  public @Nullable OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  @JsonProperty("createdAt")
  public void setCreatedAt(@Nullable OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LoomLog loomLog = (LoomLog) o;
    return Objects.equals(this.id, loomLog.id) &&
        Objects.equals(this.key, loomLog.key) &&
        Objects.equals(this.loomId, loomLog.loomId) &&
        Objects.equals(this.loomCode, loomLog.loomCode) &&
        Objects.equals(this.loomStatus, loomLog.loomStatus) &&
        Objects.equals(this.itemId, loomLog.itemId) &&
        Objects.equals(this.itemName, loomLog.itemName) &&
        Objects.equals(this.metersAdded, loomLog.metersAdded) &&
        Objects.equals(this.createdAt, loomLog.createdAt);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, key, loomId, loomCode, loomStatus, itemId, itemName, metersAdded, createdAt);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LoomLog {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    key: ").append(toIndentedString(key)).append("\n");
    sb.append("    loomId: ").append(toIndentedString(loomId)).append("\n");
    sb.append("    loomCode: ").append(toIndentedString(loomCode)).append("\n");
    sb.append("    loomStatus: ").append(toIndentedString(loomStatus)).append("\n");
    sb.append("    itemId: ").append(toIndentedString(itemId)).append("\n");
    sb.append("    itemName: ").append(toIndentedString(itemName)).append("\n");
    sb.append("    metersAdded: ").append(toIndentedString(metersAdded)).append("\n");
    sb.append("    createdAt: ").append(toIndentedString(createdAt)).append("\n");
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
