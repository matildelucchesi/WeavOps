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
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-06-12T15:53:38.999858900+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Arrangement {

  private @Nullable String id;

  private String itemName;

  private BigDecimal reedCount;

  private BigDecimal reedCM;

  private Float reedHight;

  private Float warpLenght;

  private Float piecesCount;

  private Float pieceLenght;

  private Float warpEndCount;

  private BigDecimal hitsPerDm;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private @Nullable OffsetDateTime deliveryDate;

  public Arrangement() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Arrangement(String itemName, BigDecimal reedCount, BigDecimal reedCM, Float reedHight, Float warpLenght, Float piecesCount, Float pieceLenght, Float warpEndCount, BigDecimal hitsPerDm) {
    this.itemName = itemName;
    this.reedCount = reedCount;
    this.reedCM = reedCM;
    this.reedHight = reedHight;
    this.warpLenght = warpLenght;
    this.piecesCount = piecesCount;
    this.pieceLenght = pieceLenght;
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

  public Arrangement reedHight(Float reedHight) {
    this.reedHight = reedHight;
    return this;
  }

  /**
   * Get reedHight
   * @return reedHight
   */
  @NotNull 
  @Schema(name = "reedHight", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("reedHight")
  public Float getReedHight() {
    return reedHight;
  }

  @JsonProperty("reedHight")
  public void setReedHight(Float reedHight) {
    this.reedHight = reedHight;
  }

  public Arrangement warpLenght(Float warpLenght) {
    this.warpLenght = warpLenght;
    return this;
  }

  /**
   * Lunghezza del filo di ordito in metri
   * @return warpLenght
   */
  @NotNull 
  @Schema(name = "warpLenght", description = "Lunghezza del filo di ordito in metri", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("warpLenght")
  public Float getWarpLenght() {
    return warpLenght;
  }

  @JsonProperty("warpLenght")
  public void setWarpLenght(Float warpLenght) {
    this.warpLenght = warpLenght;
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

  public Arrangement pieceLenght(Float pieceLenght) {
    this.pieceLenght = pieceLenght;
    return this;
  }

  /**
   * Lunghezza di ogni pezza in metri
   * @return pieceLenght
   */
  @NotNull 
  @Schema(name = "pieceLenght", description = "Lunghezza di ogni pezza in metri", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("pieceLenght")
  public Float getPieceLenght() {
    return pieceLenght;
  }

  @JsonProperty("pieceLenght")
  public void setPieceLenght(Float pieceLenght) {
    this.pieceLenght = pieceLenght;
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
   * Get hitsPerDm
   * @return hitsPerDm
   */
  @NotNull @Valid 
  @Schema(name = "hitsPerDm", requiredMode = Schema.RequiredMode.REQUIRED)
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
        Objects.equals(this.reedHight, arrangement.reedHight) &&
        Objects.equals(this.warpLenght, arrangement.warpLenght) &&
        Objects.equals(this.piecesCount, arrangement.piecesCount) &&
        Objects.equals(this.pieceLenght, arrangement.pieceLenght) &&
        Objects.equals(this.warpEndCount, arrangement.warpEndCount) &&
        Objects.equals(this.hitsPerDm, arrangement.hitsPerDm) &&
        Objects.equals(this.deliveryDate, arrangement.deliveryDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, itemName, reedCount, reedCM, reedHight, warpLenght, piecesCount, pieceLenght, warpEndCount, hitsPerDm, deliveryDate);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Arrangement {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    itemName: ").append(toIndentedString(itemName)).append("\n");
    sb.append("    reedCount: ").append(toIndentedString(reedCount)).append("\n");
    sb.append("    reedCM: ").append(toIndentedString(reedCM)).append("\n");
    sb.append("    reedHight: ").append(toIndentedString(reedHight)).append("\n");
    sb.append("    warpLenght: ").append(toIndentedString(warpLenght)).append("\n");
    sb.append("    piecesCount: ").append(toIndentedString(piecesCount)).append("\n");
    sb.append("    pieceLenght: ").append(toIndentedString(pieceLenght)).append("\n");
    sb.append("    warpEndCount: ").append(toIndentedString(warpEndCount)).append("\n");
    sb.append("    hitsPerDm: ").append(toIndentedString(hitsPerDm)).append("\n");
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

