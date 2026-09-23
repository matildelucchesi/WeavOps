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
 * Notification
 */

@JsonTypeName("notification")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Notification {

  private String id;

  /**
   * Gets or Sets type
   */
  public enum TypeEnum {
    ITEM_DELIVERY_RISK("ITEM_DELIVERY_RISK");

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

  /**
   * Gets or Sets severity
   */
  public enum SeverityEnum {
    INFO("INFO"),
    
    WARNING("WARNING"),
    
    ERROR("ERROR");

    private final String value;

    SeverityEnum(String value) {
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
    public static SeverityEnum fromValue(String value) {
      for (SeverityEnum b : SeverityEnum.values()) {
        if (b.value.equals(value)) {
          return b;
        }
      }
      throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
  }

  private SeverityEnum severity;

  private String title;

  private String message;

  private @Nullable String itemId;

  private @Nullable String arrangementId;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime expectedEndDate;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime deliveryDate;

  public Notification() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Notification(String id, TypeEnum type, SeverityEnum severity, String title, String message) {
    this.id = id;
    this.type = type;
    this.severity = severity;
    this.title = title;
    this.message = message;
  }

  public Notification id(String id) {
    this.id = id;
    return this;
  }

  /**
   * Identificativo stabile della notifica calcolata
   * @return id
   */
  
  @Schema(name = "id", accessMode = Schema.AccessMode.READ_ONLY, description = "Identificativo stabile della notifica calcolata", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("id")
  public String getId() {
    return id;
  }

  @JsonProperty("id")
  public void setId(String id) {
    this.id = id;
  }

  public Notification type(TypeEnum type) {
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

  public Notification severity(SeverityEnum severity) {
    this.severity = severity;
    return this;
  }

  /**
   * Get severity
   * @return severity
   */
  @NotNull 
  @Schema(name = "severity", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("severity")
  public SeverityEnum getSeverity() {
    return severity;
  }

  @JsonProperty("severity")
  public void setSeverity(SeverityEnum severity) {
    this.severity = severity;
  }

  public Notification title(String title) {
    this.title = title;
    return this;
  }

  /**
   * Get title
   * @return title
   */
  @NotNull 
  @Schema(name = "title", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("title")
  public String getTitle() {
    return title;
  }

  @JsonProperty("title")
  public void setTitle(String title) {
    this.title = title;
  }

  public Notification message(String message) {
    this.message = message;
    return this;
  }

  /**
   * Get message
   * @return message
   */
  @NotNull 
  @Schema(name = "message", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("message")
  public String getMessage() {
    return message;
  }

  @JsonProperty("message")
  public void setMessage(String message) {
    this.message = message;
  }

  public Notification itemId(@Nullable String itemId) {
    this.itemId = itemId;
    return this;
  }

  /**
   * Get itemId
   * @return itemId
   */
  
  @Schema(name = "itemId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("itemId")
  public @Nullable String getItemId() {
    return itemId;
  }

  @JsonProperty("itemId")
  public void setItemId(@Nullable String itemId) {
    this.itemId = itemId;
  }

  public Notification arrangementId(@Nullable String arrangementId) {
    this.arrangementId = arrangementId;
    return this;
  }

  /**
   * Get arrangementId
   * @return arrangementId
   */
  
  @Schema(name = "arrangementId", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("arrangementId")
  public @Nullable String getArrangementId() {
    return arrangementId;
  }

  @JsonProperty("arrangementId")
  public void setArrangementId(@Nullable String arrangementId) {
    this.arrangementId = arrangementId;
  }

  public Notification expectedEndDate(@Nullable OffsetDateTime expectedEndDate) {
    this.expectedEndDate = expectedEndDate;
    return this;
  }

  /**
   * Get expectedEndDate
   * @return expectedEndDate
   */
  @Valid 
  @Schema(name = "expectedEndDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("expectedEndDate")
  public @Nullable OffsetDateTime getExpectedEndDate() {
    return expectedEndDate;
  }

  @JsonProperty("expectedEndDate")
  public void setExpectedEndDate(@Nullable OffsetDateTime expectedEndDate) {
    this.expectedEndDate = expectedEndDate;
  }

  public Notification deliveryDate(@Nullable OffsetDateTime deliveryDate) {
    this.deliveryDate = deliveryDate;
    return this;
  }

  /**
   * Get deliveryDate
   * @return deliveryDate
   */
  @Valid 
  @Schema(name = "deliveryDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("deliveryDate")
  public @Nullable OffsetDateTime getDeliveryDate() {
    return deliveryDate;
  }

  @JsonProperty("deliveryDate")
  public void setDeliveryDate(@Nullable OffsetDateTime deliveryDate) {
    this.deliveryDate = deliveryDate;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Notification notification = (Notification) o;
    return Objects.equals(this.id, notification.id) &&
        Objects.equals(this.type, notification.type) &&
        Objects.equals(this.severity, notification.severity) &&
        Objects.equals(this.title, notification.title) &&
        Objects.equals(this.message, notification.message) &&
        Objects.equals(this.itemId, notification.itemId) &&
        Objects.equals(this.arrangementId, notification.arrangementId) &&
        Objects.equals(this.expectedEndDate, notification.expectedEndDate) &&
        Objects.equals(this.deliveryDate, notification.deliveryDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, type, severity, title, message, itemId, arrangementId, expectedEndDate, deliveryDate);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Notification {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    type: ").append(toIndentedString(type)).append("\n");
    sb.append("    severity: ").append(toIndentedString(severity)).append("\n");
    sb.append("    title: ").append(toIndentedString(title)).append("\n");
    sb.append("    message: ").append(toIndentedString(message)).append("\n");
    sb.append("    itemId: ").append(toIndentedString(itemId)).append("\n");
    sb.append("    arrangementId: ").append(toIndentedString(arrangementId)).append("\n");
    sb.append("    expectedEndDate: ").append(toIndentedString(expectedEndDate)).append("\n");
    sb.append("    deliveryDate: ").append(toIndentedString(deliveryDate)).append("\n");
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

