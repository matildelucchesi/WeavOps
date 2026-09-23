package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.openapitools.model.Loom;
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
 * Process
 */

@JsonTypeName("process")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Process {

  private @Nullable String id;

  private BigDecimal speed;

  private BigDecimal efficiency;

  private BigDecimal totalMeters;

  private BigDecimal metersRun;

  private BigDecimal metersToGo;

  private @Nullable BigDecimal totalPieces;

  private @Nullable BigDecimal piecesRun;

  private @Nullable BigDecimal metersPerPiece;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private OffsetDateTime startDate;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime endDate;

  private @Nullable Float days;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime expectedEndDate;

  private @Nullable Loom loom;

  private @Nullable BigDecimal itemHitsPerDm;

  public Process() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Process(BigDecimal speed, BigDecimal efficiency, BigDecimal totalMeters, BigDecimal metersRun, BigDecimal metersToGo, OffsetDateTime startDate) {
    this.speed = speed;
    this.efficiency = efficiency;
    this.totalMeters = totalMeters;
    this.metersRun = metersRun;
    this.metersToGo = metersToGo;
    this.startDate = startDate;
  }

  public Process id(@Nullable String id) {
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

  public Process speed(BigDecimal speed) {
    this.speed = speed;
    return this;
  }

  /**
   * Get speed
   * @return speed
   */
  @NotNull @Valid 
  @Schema(name = "speed", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("speed")
  public BigDecimal getSpeed() {
    return speed;
  }

  @JsonProperty("speed")
  public void setSpeed(BigDecimal speed) {
    this.speed = speed;
  }

  public Process efficiency(BigDecimal efficiency) {
    this.efficiency = efficiency;
    return this;
  }

  /**
   * Get efficiency
   * @return efficiency
   */
  @NotNull @Valid 
  @Schema(name = "efficiency", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("efficiency")
  public BigDecimal getEfficiency() {
    return efficiency;
  }

  @JsonProperty("efficiency")
  public void setEfficiency(BigDecimal efficiency) {
    this.efficiency = efficiency;
  }

  public Process totalMeters(BigDecimal totalMeters) {
    this.totalMeters = totalMeters;
    return this;
  }

  /**
   * Get totalMeters
   * @return totalMeters
   */
  @NotNull @Valid 
  @Schema(name = "totalMeters", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("totalMeters")
  public BigDecimal getTotalMeters() {
    return totalMeters;
  }

  @JsonProperty("totalMeters")
  public void setTotalMeters(BigDecimal totalMeters) {
    this.totalMeters = totalMeters;
  }

  public Process metersRun(BigDecimal metersRun) {
    this.metersRun = metersRun;
    return this;
  }

  /**
   * Get metersRun
   * @return metersRun
   */
  @NotNull @Valid 
  @Schema(name = "metersRun", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("metersRun")
  public BigDecimal getMetersRun() {
    return metersRun;
  }

  @JsonProperty("metersRun")
  public void setMetersRun(BigDecimal metersRun) {
    this.metersRun = metersRun;
  }

  public Process metersToGo(BigDecimal metersToGo) {
    this.metersToGo = metersToGo;
    return this;
  }

  /**
   * Get metersToGo
   * @return metersToGo
   */
  @NotNull @Valid 
  @Schema(name = "metersToGo", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("metersToGo")
  public BigDecimal getMetersToGo() {
    return metersToGo;
  }

  @JsonProperty("metersToGo")
  public void setMetersToGo(BigDecimal metersToGo) {
    this.metersToGo = metersToGo;
  }

  public Process totalPieces(@Nullable BigDecimal totalPieces) {
    this.totalPieces = totalPieces;
    return this;
  }

  /**
   * Get totalPieces
   * @return totalPieces
   */
  @Valid 
  @Schema(name = "totalPieces", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("totalPieces")
  public @Nullable BigDecimal getTotalPieces() {
    return totalPieces;
  }

  @JsonProperty("totalPieces")
  public void setTotalPieces(@Nullable BigDecimal totalPieces) {
    this.totalPieces = totalPieces;
  }

  public Process piecesRun(@Nullable BigDecimal piecesRun) {
    this.piecesRun = piecesRun;
    return this;
  }

  /**
   * Get piecesRun
   * @return piecesRun
   */
  @Valid 
  @Schema(name = "piecesRun", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("piecesRun")
  public @Nullable BigDecimal getPiecesRun() {
    return piecesRun;
  }

  @JsonProperty("piecesRun")
  public void setPiecesRun(@Nullable BigDecimal piecesRun) {
    this.piecesRun = piecesRun;
  }

  public Process metersPerPiece(@Nullable BigDecimal metersPerPiece) {
    this.metersPerPiece = metersPerPiece;
    return this;
  }

  /**
   * Get metersPerPiece
   * @return metersPerPiece
   */
  @Valid 
  @Schema(name = "metersPerPiece", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("metersPerPiece")
  public @Nullable BigDecimal getMetersPerPiece() {
    return metersPerPiece;
  }

  @JsonProperty("metersPerPiece")
  public void setMetersPerPiece(@Nullable BigDecimal metersPerPiece) {
    this.metersPerPiece = metersPerPiece;
  }

  public Process startDate(OffsetDateTime startDate) {
    this.startDate = startDate;
    return this;
  }

  /**
   * Get startDate
   * @return startDate
   */
  @NotNull @Valid 
  @Schema(name = "startDate", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("startDate")
  public OffsetDateTime getStartDate() {
    return startDate;
  }

  @JsonProperty("startDate")
  public void setStartDate(OffsetDateTime startDate) {
    this.startDate = startDate;
  }

  public Process endDate(@Nullable OffsetDateTime endDate) {
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

  public Process days(@Nullable Float days) {
    this.days = days;
    return this;
  }

  /**
   * Get days
   * @return days
   */
  
  @Schema(name = "days", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("days")
  public @Nullable Float getDays() {
    return days;
  }

  @JsonProperty("days")
  public void setDays(@Nullable Float days) {
    this.days = days;
  }

  public Process expectedEndDate(@Nullable OffsetDateTime expectedEndDate) {
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

  public Process loom(@Nullable Loom loom) {
    this.loom = loom;
    return this;
  }

  /**
   * Get loom
   * @return loom
   */
  @Valid 
  @Schema(name = "loom", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("loom")
  public @Nullable Loom getLoom() {
    return loom;
  }

  @JsonProperty("loom")
  public void setLoom(@Nullable Loom loom) {
    this.loom = loom;
  }

  public Process itemHitsPerDm(@Nullable BigDecimal itemHitsPerDm) {
    this.itemHitsPerDm = itemHitsPerDm;
    return this;
  }

  /**
   * Get itemHitsPerDm
   * @return itemHitsPerDm
   */
  @Valid 
  @Schema(name = "itemHitsPerDm", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("itemHitsPerDm")
  public @Nullable BigDecimal getItemHitsPerDm() {
    return itemHitsPerDm;
  }

  @JsonProperty("itemHitsPerDm")
  public void setItemHitsPerDm(@Nullable BigDecimal itemHitsPerDm) {
    this.itemHitsPerDm = itemHitsPerDm;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Process process = (Process) o;
    return Objects.equals(this.id, process.id) &&
        Objects.equals(this.speed, process.speed) &&
        Objects.equals(this.efficiency, process.efficiency) &&
        Objects.equals(this.totalMeters, process.totalMeters) &&
        Objects.equals(this.metersRun, process.metersRun) &&
        Objects.equals(this.metersToGo, process.metersToGo) &&
        Objects.equals(this.totalPieces, process.totalPieces) &&
        Objects.equals(this.piecesRun, process.piecesRun) &&
        Objects.equals(this.metersPerPiece, process.metersPerPiece) &&
        Objects.equals(this.startDate, process.startDate) &&
        Objects.equals(this.endDate, process.endDate) &&
        Objects.equals(this.days, process.days) &&
        Objects.equals(this.expectedEndDate, process.expectedEndDate) &&
        Objects.equals(this.loom, process.loom) &&
        Objects.equals(this.itemHitsPerDm, process.itemHitsPerDm);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, speed, efficiency, totalMeters, metersRun, metersToGo, totalPieces, piecesRun, metersPerPiece, startDate, endDate, days, expectedEndDate, loom, itemHitsPerDm);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Process {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    speed: ").append(toIndentedString(speed)).append("\n");
    sb.append("    efficiency: ").append(toIndentedString(efficiency)).append("\n");
    sb.append("    totalMeters: ").append(toIndentedString(totalMeters)).append("\n");
    sb.append("    metersRun: ").append(toIndentedString(metersRun)).append("\n");
    sb.append("    metersToGo: ").append(toIndentedString(metersToGo)).append("\n");
    sb.append("    totalPieces: ").append(toIndentedString(totalPieces)).append("\n");
    sb.append("    piecesRun: ").append(toIndentedString(piecesRun)).append("\n");
    sb.append("    metersPerPiece: ").append(toIndentedString(metersPerPiece)).append("\n");
    sb.append("    startDate: ").append(toIndentedString(startDate)).append("\n");
    sb.append("    endDate: ").append(toIndentedString(endDate)).append("\n");
    sb.append("    days: ").append(toIndentedString(days)).append("\n");
    sb.append("    expectedEndDate: ").append(toIndentedString(expectedEndDate)).append("\n");
    sb.append("    loom: ").append(toIndentedString(loom)).append("\n");
    sb.append("    itemHitsPerDm: ").append(toIndentedString(itemHitsPerDm)).append("\n");
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

