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
 * LoomProcessHistory
 */

@JsonTypeName("loom-process-history")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-15T12:18:51.296312700+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class LoomProcessHistory {

  private @Nullable String id;

  private String loomId;

  private String processId;

  public LoomProcessHistory() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public LoomProcessHistory(String loomId, String processId) {
    this.loomId = loomId;
    this.processId = processId;
  }

  public LoomProcessHistory id(@Nullable String id) {
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

  public LoomProcessHistory loomId(String loomId) {
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

  public LoomProcessHistory processId(String processId) {
    this.processId = processId;
    return this;
  }

  /**
   * Get processId
   * @return processId
   */
  @NotNull 
  @Schema(name = "processId", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("processId")
  public String getProcessId() {
    return processId;
  }

  @JsonProperty("processId")
  public void setProcessId(String processId) {
    this.processId = processId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    LoomProcessHistory loomProcessHistory = (LoomProcessHistory) o;
    return Objects.equals(this.id, loomProcessHistory.id) &&
        Objects.equals(this.loomId, loomProcessHistory.loomId) &&
        Objects.equals(this.processId, loomProcessHistory.processId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, loomId, processId);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class LoomProcessHistory {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    loomId: ").append(toIndentedString(loomId)).append("\n");
    sb.append("    processId: ").append(toIndentedString(processId)).append("\n");
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

