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
 * CalendarEventCategory
 */

@JsonTypeName("calendar-event-category")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class CalendarEventCategory {

  private @Nullable String id;

  private String name;

  private String color;

  private @Nullable Boolean standard;

  public CalendarEventCategory() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public CalendarEventCategory(String name, String color) {
    this.name = name;
    this.color = color;
  }

  public CalendarEventCategory id(@Nullable String id) {
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

  public CalendarEventCategory name(String name) {
    this.name = name;
    return this;
  }

  /**
   * Get name
   * @return name
   */
  @NotNull 
  @Schema(name = "name", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("name")
  public String getName() {
    return name;
  }

  @JsonProperty("name")
  public void setName(String name) {
    this.name = name;
  }

  public CalendarEventCategory color(String color) {
    this.color = color;
    return this;
  }

  /**
   * Get color
   * @return color
   */
  @NotNull @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") 
  @Schema(name = "color", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("color")
  public String getColor() {
    return color;
  }

  @JsonProperty("color")
  public void setColor(String color) {
    this.color = color;
  }

  public CalendarEventCategory standard(@Nullable Boolean standard) {
    this.standard = standard;
    return this;
  }

  /**
   * Get standard
   * @return standard
   */
  
  @Schema(name = "standard", accessMode = Schema.AccessMode.READ_ONLY, requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("standard")
  public @Nullable Boolean getStandard() {
    return standard;
  }

  @JsonProperty("standard")
  public void setStandard(@Nullable Boolean standard) {
    this.standard = standard;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    CalendarEventCategory calendarEventCategory = (CalendarEventCategory) o;
    return Objects.equals(this.id, calendarEventCategory.id) &&
        Objects.equals(this.name, calendarEventCategory.name) &&
        Objects.equals(this.color, calendarEventCategory.color) &&
        Objects.equals(this.standard, calendarEventCategory.standard);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, name, color, standard);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class CalendarEventCategory {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    color: ").append(toIndentedString(color)).append("\n");
    sb.append("    standard: ").append(toIndentedString(standard)).append("\n");
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

