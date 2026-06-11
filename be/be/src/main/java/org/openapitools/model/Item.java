package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.openapitools.model.Arrangement;
import org.openapitools.model.Customer;
import org.openapitools.model.Process;
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
 * Item
 */

@JsonTypeName("item")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-06-10T16:33:28.608747+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Item {

  private @Nullable String id;

  private Arrangement arrangement;

  /**
   * Gets or Sets state
   */
  public enum StateEnum {
    INITIALIZED("INITIALIZED"),
    
    RUNNING("RUNNING"),
    
    COMPLETED("COMPLETED"),
    
    ABANDONED("ABANDONED");

    private final String value;

    StateEnum(String value) {
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
    public static StateEnum fromValue(String value) {
      for (StateEnum b : StateEnum.values()) {
        if (b.value.equals(value)) {
          return b;
        }
      }
      throw new IllegalArgumentException("Unexpected value '" + value + "'");
    }
  }

  private @Nullable StateEnum state;

  private Customer customer;

  private @Nullable BigDecimal totalMeters;

  private @Nullable BigDecimal metersRun;

  @Valid
  private List<@Valid Process> processing = new ArrayList<>();

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime expectedEndDate;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime endDate;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime startDate;

  public Item() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Item(Arrangement arrangement, Customer customer) {
    this.arrangement = arrangement;
    this.customer = customer;
  }

  public Item id(@Nullable String id) {
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

  public Item arrangement(Arrangement arrangement) {
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

  public Item state(@Nullable StateEnum state) {
    this.state = state;
    return this;
  }

  /**
   * Get state
   * @return state
   */
  
  @Schema(name = "state", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("state")
  public @Nullable StateEnum getState() {
    return state;
  }

  @JsonProperty("state")
  public void setState(@Nullable StateEnum state) {
    this.state = state;
  }

  public Item customer(Customer customer) {
    this.customer = customer;
    return this;
  }

  /**
   * Get customer
   * @return customer
   */
  @NotNull @Valid 
  @Schema(name = "customer", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("customer")
  public Customer getCustomer() {
    return customer;
  }

  @JsonProperty("customer")
  public void setCustomer(Customer customer) {
    this.customer = customer;
  }

  public Item totalMeters(@Nullable BigDecimal totalMeters) {
    this.totalMeters = totalMeters;
    return this;
  }

  /**
   * Get totalMeters
   * @return totalMeters
   */
  @Valid 
  @Schema(name = "totalMeters", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("totalMeters")
  public @Nullable BigDecimal getTotalMeters() {
    return totalMeters;
  }

  @JsonProperty("totalMeters")
  public void setTotalMeters(@Nullable BigDecimal totalMeters) {
    this.totalMeters = totalMeters;
  }

  public Item metersRun(@Nullable BigDecimal metersRun) {
    this.metersRun = metersRun;
    return this;
  }

  /**
   * Get metersRun
   * @return metersRun
   */
  @Valid 
  @Schema(name = "metersRun", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("metersRun")
  public @Nullable BigDecimal getMetersRun() {
    return metersRun;
  }

  @JsonProperty("metersRun")
  public void setMetersRun(@Nullable BigDecimal metersRun) {
    this.metersRun = metersRun;
  }

  public Item processing(List<@Valid Process> processing) {
    this.processing = processing;
    return this;
  }

  public Item addProcessingItem(Process processingItem) {
    if (this.processing == null) {
      this.processing = new ArrayList<>();
    }
    this.processing.add(processingItem);
    return this;
  }

  /**
   * Get processing
   * @return processing
   */
  @Valid 
  @Schema(name = "processing", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("processing")
  public List<@Valid Process> getProcessing() {
    return processing;
  }

  @JsonProperty("processing")
  public void setProcessing(List<@Valid Process> processing) {
    this.processing = processing;
  }

  public Item expectedEndDate(@Nullable OffsetDateTime expectedEndDate) {
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

  public Item endDate(@Nullable OffsetDateTime endDate) {
    this.endDate = endDate;
    return this;
  }

  /**
   * Get endDate
   * @return endDate
   */
  @Valid 
  @Schema(name = "endDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("endDate")
  public @Nullable OffsetDateTime getEndDate() {
    return endDate;
  }

  @JsonProperty("endDate")
  public void setEndDate(@Nullable OffsetDateTime endDate) {
    this.endDate = endDate;
  }

  public Item startDate(@Nullable OffsetDateTime startDate) {
    this.startDate = startDate;
    return this;
  }

  /**
   * Get startDate
   * @return startDate
   */
  @Valid 
  @Schema(name = "startDate", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("startDate")
  public @Nullable OffsetDateTime getStartDate() {
    return startDate;
  }

  @JsonProperty("startDate")
  public void setStartDate(@Nullable OffsetDateTime startDate) {
    this.startDate = startDate;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Item item = (Item) o;
    return Objects.equals(this.id, item.id) &&
        Objects.equals(this.arrangement, item.arrangement) &&
        Objects.equals(this.state, item.state) &&
        Objects.equals(this.customer, item.customer) &&
        Objects.equals(this.totalMeters, item.totalMeters) &&
        Objects.equals(this.metersRun, item.metersRun) &&
        Objects.equals(this.processing, item.processing) &&
        Objects.equals(this.expectedEndDate, item.expectedEndDate) &&
        Objects.equals(this.endDate, item.endDate) &&
        Objects.equals(this.startDate, item.startDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, arrangement, state, customer, totalMeters, metersRun, processing, expectedEndDate, endDate, startDate);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Item {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    arrangement: ").append(toIndentedString(arrangement)).append("\n");
    sb.append("    state: ").append(toIndentedString(state)).append("\n");
    sb.append("    customer: ").append(toIndentedString(customer)).append("\n");
    sb.append("    totalMeters: ").append(toIndentedString(totalMeters)).append("\n");
    sb.append("    metersRun: ").append(toIndentedString(metersRun)).append("\n");
    sb.append("    processing: ").append(toIndentedString(processing)).append("\n");
    sb.append("    expectedEndDate: ").append(toIndentedString(expectedEndDate)).append("\n");
    sb.append("    endDate: ").append(toIndentedString(endDate)).append("\n");
    sb.append("    startDate: ").append(toIndentedString(startDate)).append("\n");
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

