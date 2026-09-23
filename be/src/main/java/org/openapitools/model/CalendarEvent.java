package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import java.time.OffsetDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.lang.Nullable;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * CalendarEvent
 */

@JsonTypeName("calendar-event")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class CalendarEvent {

  private @Nullable String id;

  private String description;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private OffsetDateTime date;

  private @Nullable String assignmentId;

  private @Nullable String loomId;

  private @Nullable String itemId;

  private @Nullable String processId;

  private @Nullable String arrangementId;

  private @Nullable String categoryId;

  /**
   * Gets or Sets type
   */
  public enum TypeEnum {
    GENERIC("GENERIC"),
    
    DELIVERY("DELIVERY"),
    
    ITEM_FORECAST("ITEM_FORECAST"),
    
    LOOM_FORECAST("LOOM_FORECAST"),
    
    CLOSURE("CLOSURE");

    private final String value;

    TypeEnum(String value) {
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
    public static TypeEnum fromValue(String value) {
      for (TypeEnum b : TypeEnum.values()) {
        if (b.value.equals(value)) {
          return b;
        }
      }
      throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
  }

  private TypeEnum type;

  public CalendarEvent() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public CalendarEvent(String description, OffsetDateTime date, TypeEnum type) {
    this.description = description;
    this.date = date;
    this.type = type;
  }

  public CalendarEvent id(@Nullable String id) {
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

  public CalendarEvent description(String description) {
    this.description = description;
    return this;
  }

  /**
   * Descrizione dell'evento
   * @return description
   */
  @NotNull 
  @Schema(name = "description", description = "Descrizione dell'evento", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("description")
  public String getDescription() {
    return description;
  }

  @JsonProperty("description")
  public void setDescription(String description) {
    this.description = description;
  }

  public CalendarEvent date(OffsetDateTime date) {
    this.date = date;
    return this;
  }

  /**
   * Data e ora dell'evento
   * @return date
   */
  @NotNull @Valid 
  @Schema(name = "date", description = "Data e ora dell'evento", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("date")
  public OffsetDateTime getDate() {
    return date;
  }

  @JsonProperty("date")
  public void setDate(OffsetDateTime date) {
    this.date = date;
  }

  public CalendarEvent assignmentId(@Nullable String assignmentId) {
    this.assignmentId = assignmentId;
    return this;
  }

  /**
   * Identificativo dell'assegnazione dell'evento
   * @return assignmentId
   */
  
  @Schema(name = "assignmentId", description = "Identificativo dell'assegnazione dell'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("assignmentId")
  public @Nullable String getAssignmentId() {
    return assignmentId;
  }

  @JsonProperty("assignmentId")
  public void setAssignmentId(@Nullable String assignmentId) {
    this.assignmentId = assignmentId;
  }

  public CalendarEvent loomId(@Nullable String loomId) {
    this.loomId = loomId;
    return this;
  }

  /**
   * Identificativo del loom associato all'evento
   * @return loomId
   */
  
  @Schema(name = "loomId", description = "Identificativo del loom associato all'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("loomId")
  public @Nullable String getLoomId() {
    return loomId;
  }

  @JsonProperty("loomId")
  public void setLoomId(@Nullable String loomId) {
    this.loomId = loomId;
  }

  public CalendarEvent itemId(@Nullable String itemId) {
    this.itemId = itemId;
    return this;
  }

  /**
   * Identificativo dell'item associato all'evento
   * @return itemId
   */
  
  @Schema(name = "itemId", description = "Identificativo dell'item associato all'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("itemId")
  public @Nullable String getItemId() {
    return itemId;
  }

  @JsonProperty("itemId")
  public void setItemId(@Nullable String itemId) {
    this.itemId = itemId;
  }

  public CalendarEvent processId(@Nullable String processId) {
    this.processId = processId;
    return this;
  }

  /**
   * Identificativo del processo associato all'evento
   * @return processId
   */
  
  @Schema(name = "processId", description = "Identificativo del processo associato all'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("processId")
  public @Nullable String getProcessId() {
    return processId;
  }

  @JsonProperty("processId")
  public void setProcessId(@Nullable String processId) {
    this.processId = processId;
  }

  public CalendarEvent arrangementId(@Nullable String arrangementId) {
    this.arrangementId = arrangementId;
    return this;
  }

  /**
   * Identificativo della disposizione associata all'evento
   * @return arrangementId
   */
  
  @Schema(name = "arrangementId", description = "Identificativo della disposizione associata all'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("arrangementId")
  public @Nullable String getArrangementId() {
    return arrangementId;
  }

  @JsonProperty("arrangementId")
  public void setArrangementId(@Nullable String arrangementId) {
    this.arrangementId = arrangementId;
  }

  public CalendarEvent categoryId(@Nullable String categoryId) {
    this.categoryId = categoryId;
    return this;
  }

  /**
   * Identificativo della categoria custom associata all'evento
   * @return categoryId
   */
  
  @Schema(name = "categoryId", description = "Identificativo della categoria custom associata all'evento", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("categoryId")
  public @Nullable String getCategoryId() {
    return categoryId;
  }

  @JsonProperty("categoryId")
  public void setCategoryId(@Nullable String categoryId) {
    this.categoryId = categoryId;
  }

  public CalendarEvent type(TypeEnum type) {
    this.type = type;
    return this;
  }

  /**
   * Get type
   * @return type
   */
  @NotNull 
  @Schema(name = "type", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("type")
  public TypeEnum getType() {
    return type;
  }

  @JsonProperty("type")
  public void setType(TypeEnum type) {
    this.type = type;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CalendarEvent calendarEvent = (CalendarEvent) o;
    return Objects.equals(this.id, calendarEvent.id) &&
        Objects.equals(this.description, calendarEvent.description) &&
        Objects.equals(this.date, calendarEvent.date) &&
        Objects.equals(this.assignmentId, calendarEvent.assignmentId) &&
        Objects.equals(this.loomId, calendarEvent.loomId) &&
        Objects.equals(this.itemId, calendarEvent.itemId) &&
        Objects.equals(this.processId, calendarEvent.processId) &&
        Objects.equals(this.arrangementId, calendarEvent.arrangementId) &&
        Objects.equals(this.categoryId, calendarEvent.categoryId) &&
        Objects.equals(this.type, calendarEvent.type);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, description, date, assignmentId, loomId, itemId, processId, arrangementId, categoryId, type);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CalendarEvent {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    description: ").append(toIndentedString(description)).append("\n");
    sb.append("    date: ").append(toIndentedString(date)).append("\n");
    sb.append("    assignmentId: ").append(toIndentedString(assignmentId)).append("\n");
    sb.append("    loomId: ").append(toIndentedString(loomId)).append("\n");
    sb.append("    itemId: ").append(toIndentedString(itemId)).append("\n");
    sb.append("    processId: ").append(toIndentedString(processId)).append("\n");
    sb.append("    arrangementId: ").append(toIndentedString(arrangementId)).append("\n");
    sb.append("    categoryId: ").append(toIndentedString(categoryId)).append("\n");
    sb.append("    type: ").append(toIndentedString(type)).append("\n");
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

