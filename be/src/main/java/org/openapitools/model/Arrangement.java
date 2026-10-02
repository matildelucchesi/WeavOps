package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.math.BigDecimal;
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
 * Arrangement
 */

@JsonTypeName("arrangement")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-20T09:27:07.285474300+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Arrangement {

  private @Nullable String id;

  private String itemName;

  private BigDecimal reedCount;

  private BigDecimal reedCM;

  private @Nullable Float reedHeight;

  private @Nullable Float warpLength;

  private Float piecesCount;

  private @Nullable Float pieceLength;

  private Float warpEndCount;

  private BigDecimal hitsPerDm;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime deliveryDate;

  private @Nullable Boolean worksSaturday;
  private @Nullable String saturdayStartTime;
  private @Nullable String saturdayEndTime;
  private @Nullable Boolean worksSunday;
  private @Nullable String sundayStartTime;
  private @Nullable String sundayEndTime;

  public Arrangement() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Arrangement(String itemName, BigDecimal reedCount, BigDecimal reedCM, Float piecesCount, Float warpEndCount, BigDecimal hitsPerDm) {
    this.itemName = itemName;
    this.reedCount = reedCount;
    this.reedCM = reedCM;
    this.piecesCount = piecesCount;
    this.warpEndCount = warpEndCount;
    this.hitsPerDm = hitsPerDm;
  }

  public Arrangement id(@Nullable String id) {
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

  public Arrangement itemName(String itemName) {
    this.itemName = itemName;
    return this;
  }

  /**
   * Get itemName
   * @return itemName
   */
  @NotNull 
  @Schema(name = "itemName", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("itemName")
  public String getItemName() {
    return itemName;
  }

  @JsonProperty("itemName")
  public void setItemName(String itemName) {
    this.itemName = itemName;
  }

  public Arrangement reedCount(BigDecimal reedCount) {
    this.reedCount = reedCount;
    return this;
  }

  /**
   * Numero di denti del pettine - quanti denti ci sono per unità di misura
   * @return reedCount
   */
  @NotNull @Valid 
  @Schema(name = "reedCount", description = "Numero di denti del pettine - quanti denti ci sono per unità di misura", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("reedCount")
  public BigDecimal getReedCount() {
    return reedCount;
  }

  @JsonProperty("reedCount")
  public void setReedCount(BigDecimal reedCount) {
    this.reedCount = reedCount;
  }

  public Arrangement reedCM(BigDecimal reedCM) {
    this.reedCM = reedCM;
    return this;
  }

  /**
   * Numero di centimetri del pettine
   * @return reedCM
   */
  @NotNull @Valid 
  @Schema(name = "reedCM", description = "Numero di centimetri del pettine", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("reedCM")
  public BigDecimal getReedCM() {
    return reedCM;
  }

  @JsonProperty("reedCM")
  public void setReedCM(BigDecimal reedCM) {
    this.reedCM = reedCM;
  }

  public Arrangement reedHeight(@Nullable Float reedHeight) {
    this.reedHeight = reedHeight;
    return this;
  }

  /**
   * Get reedHeight
   * @return reedHeight
   */
  
  @Schema(name = "reedHeight", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("reedHeight")
  public @Nullable Float getReedHeight() {
    return reedHeight;
  }

  @JsonProperty("reedHeight")
  public void setReedHeight(@Nullable Float reedHeight) {
    this.reedHeight = reedHeight;
  }

  public Arrangement warpLength(@Nullable Float warpLength) {
    this.warpLength = warpLength;
    return this;
  }

  /**
   * Lunghezza del filo di ordito in metri
   * @return warpLength
   */
  
  @Schema(name = "warpLength", description = "Lunghezza del filo di ordito in metri", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("warpLength")
  public @Nullable Float getWarpLength() {
    return warpLength;
  }

  @JsonProperty("warpLength")
  public void setWarpLength(@Nullable Float warpLength) {
    this.warpLength = warpLength;
  }

  public Arrangement piecesCount(Float piecesCount) {
    this.piecesCount = piecesCount;
    return this;
  }

  /**
   * Numero di pezze che devono essere prodotte
   * @return piecesCount
   */
  @NotNull 
  @Schema(name = "piecesCount", description = "Numero di pezze che devono essere prodotte", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("piecesCount")
  public Float getPiecesCount() {
    return piecesCount;
  }

  @JsonProperty("piecesCount")
  public void setPiecesCount(Float piecesCount) {
    this.piecesCount = piecesCount;
  }

  public Arrangement pieceLength(@Nullable Float pieceLength) {
    this.pieceLength = pieceLength;
    return this;
  }

  /**
   * Lunghezza di ogni pezza in metri
   * @return pieceLength
   */
  
  @Schema(name = "pieceLength", description = "Lunghezza di ogni pezza in metri", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("pieceLength")
  public @Nullable Float getPieceLength() {
    return pieceLength;
  }

  @JsonProperty("pieceLength")
  public void setPieceLength(@Nullable Float pieceLength) {
    this.pieceLength = pieceLength;
  }

  public Arrangement warpEndCount(Float warpEndCount) {
    this.warpEndCount = warpEndCount;
    return this;
  }

  /**
   * Numero fili ordito
   * @return warpEndCount
   */
  @NotNull 
  @Schema(name = "warpEndCount", description = "Numero fili ordito", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("warpEndCount")
  public Float getWarpEndCount() {
    return warpEndCount;
  }

  @JsonProperty("warpEndCount")
  public void setWarpEndCount(Float warpEndCount) {
    this.warpEndCount = warpEndCount;
  }

  public Arrangement hitsPerDm(BigDecimal hitsPerDm) {
    this.hitsPerDm = hitsPerDm;
    return this;
  }

  /**
   * Numero di colpi per decimetro
   * @return hitsPerDm
   */
  @NotNull @Valid 
  @Schema(name = "hitsPerDm", description = "Numero di colpi per decimetro", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("hitsPerDm")
  public BigDecimal getHitsPerDm() {
    return hitsPerDm;
  }

  @JsonProperty("hitsPerDm")
  public void setHitsPerDm(BigDecimal hitsPerDm) {
    this.hitsPerDm = hitsPerDm;
  }

  public Arrangement deliveryDate(@Nullable OffsetDateTime deliveryDate) {
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


  public Arrangement worksSaturday(@Nullable Boolean worksSaturday) { this.worksSaturday = worksSaturday; return this; }
  @Schema(name = "worksSaturday", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("worksSaturday")
  public @Nullable Boolean getWorksSaturday() { return worksSaturday; }
  @JsonProperty("worksSaturday")
  public void setWorksSaturday(@Nullable Boolean worksSaturday) { this.worksSaturday = worksSaturday; }

  public Arrangement saturdayStartTime(@Nullable String saturdayStartTime) { this.saturdayStartTime = saturdayStartTime; return this; }
  @Schema(name = "saturdayStartTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("saturdayStartTime")
  public @Nullable String getSaturdayStartTime() { return saturdayStartTime; }
  @JsonProperty("saturdayStartTime")
  public void setSaturdayStartTime(@Nullable String saturdayStartTime) { this.saturdayStartTime = saturdayStartTime; }

  public Arrangement saturdayEndTime(@Nullable String saturdayEndTime) { this.saturdayEndTime = saturdayEndTime; return this; }
  @Schema(name = "saturdayEndTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("saturdayEndTime")
  public @Nullable String getSaturdayEndTime() { return saturdayEndTime; }
  @JsonProperty("saturdayEndTime")
  public void setSaturdayEndTime(@Nullable String saturdayEndTime) { this.saturdayEndTime = saturdayEndTime; }

  public Arrangement worksSunday(@Nullable Boolean worksSunday) { this.worksSunday = worksSunday; return this; }
  @Schema(name = "worksSunday", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("worksSunday")
  public @Nullable Boolean getWorksSunday() { return worksSunday; }
  @JsonProperty("worksSunday")
  public void setWorksSunday(@Nullable Boolean worksSunday) { this.worksSunday = worksSunday; }

  public Arrangement sundayStartTime(@Nullable String sundayStartTime) { this.sundayStartTime = sundayStartTime; return this; }
  @Schema(name = "sundayStartTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("sundayStartTime")
  public @Nullable String getSundayStartTime() { return sundayStartTime; }
  @JsonProperty("sundayStartTime")
  public void setSundayStartTime(@Nullable String sundayStartTime) { this.sundayStartTime = sundayStartTime; }

  public Arrangement sundayEndTime(@Nullable String sundayEndTime) { this.sundayEndTime = sundayEndTime; return this; }
  @Schema(name = "sundayEndTime", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("sundayEndTime")
  public @Nullable String getSundayEndTime() { return sundayEndTime; }
  @JsonProperty("sundayEndTime")
  public void setSundayEndTime(@Nullable String sundayEndTime) { this.sundayEndTime = sundayEndTime; }
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Arrangement arrangement = (Arrangement) o;
    return Objects.equals(this.id, arrangement.id) &&
        Objects.equals(this.itemName, arrangement.itemName) &&
        Objects.equals(this.reedCount, arrangement.reedCount) &&
        Objects.equals(this.reedCM, arrangement.reedCM) &&
        Objects.equals(this.reedHeight, arrangement.reedHeight) &&
        Objects.equals(this.warpLength, arrangement.warpLength) &&
        Objects.equals(this.piecesCount, arrangement.piecesCount) &&
        Objects.equals(this.pieceLength, arrangement.pieceLength) &&
        Objects.equals(this.warpEndCount, arrangement.warpEndCount) &&
        Objects.equals(this.hitsPerDm, arrangement.hitsPerDm) &&
        Objects.equals(this.deliveryDate, arrangement.deliveryDate) &&
        Objects.equals(this.worksSaturday, arrangement.worksSaturday) &&
        Objects.equals(this.saturdayStartTime, arrangement.saturdayStartTime) &&
        Objects.equals(this.saturdayEndTime, arrangement.saturdayEndTime) &&
        Objects.equals(this.worksSunday, arrangement.worksSunday) &&
        Objects.equals(this.sundayStartTime, arrangement.sundayStartTime) &&
        Objects.equals(this.sundayEndTime, arrangement.sundayEndTime);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, itemName, reedCount, reedCM, reedHeight, warpLength, piecesCount, pieceLength, warpEndCount, hitsPerDm, deliveryDate, worksSaturday, saturdayStartTime, saturdayEndTime, worksSunday, sundayStartTime, sundayEndTime);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Arrangement {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    itemName: ").append(toIndentedString(itemName)).append("\n");
    sb.append("    reedCount: ").append(toIndentedString(reedCount)).append("\n");
    sb.append("    reedCM: ").append(toIndentedString(reedCM)).append("\n");
    sb.append("    reedHeight: ").append(toIndentedString(reedHeight)).append("\n");
    sb.append("    warpLength: ").append(toIndentedString(warpLength)).append("\n");
    sb.append("    piecesCount: ").append(toIndentedString(piecesCount)).append("\n");
    sb.append("    pieceLength: ").append(toIndentedString(pieceLength)).append("\n");
    sb.append("    warpEndCount: ").append(toIndentedString(warpEndCount)).append("\n");
    sb.append("    hitsPerDm: ").append(toIndentedString(hitsPerDm)).append("\n");
    sb.append("    deliveryDate: ").append(toIndentedString(deliveryDate)).append("\n");
    sb.append("    worksSaturday: ").append(toIndentedString(worksSaturday)).append("\n");
    sb.append("    saturdayStartTime: ").append(toIndentedString(saturdayStartTime)).append("\n");
    sb.append("    saturdayEndTime: ").append(toIndentedString(saturdayEndTime)).append("\n");
    sb.append("    worksSunday: ").append(toIndentedString(worksSunday)).append("\n");
    sb.append("    sundayStartTime: ").append(toIndentedString(sundayStartTime)).append("\n");
    sb.append("    sundayEndTime: ").append(toIndentedString(sundayEndTime)).append("\n");
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

