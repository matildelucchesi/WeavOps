package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
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
 * Previsione della produzione di un articolo. La capacita di riferimento per un nuovo telaio corrisponde alla capacita giornaliera media dei telai gia in produzione.
 */

@Schema(name = "production-advice", description = "Previsione della produzione di un articolo. La capacita di riferimento per un nuovo telaio corrisponde alla capacita giornaliera media dei telai gia in produzione.")
@JsonTypeName("production-advice")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-15T15:46:57.800382600+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class ProductionAdvice {

  private Integer remainingMeters;

  private Float daysUntilDelivery;

  private Integer currentRunningLooms;

  private Float currentDailyCapacity;

  private Float requiredDailyCapacity;

  private Float additionalDailyCapacity;

  private Float referenceDailyCapacity;

  private Integer recommendedAdditionalLooms;

  private Integer recommendedTotalLooms;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private OffsetDateTime estimatedCompletionDate;

  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  private OffsetDateTime deliveryDate;

  private Boolean meetsDeliveryDate;

  public ProductionAdvice() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public ProductionAdvice(Integer remainingMeters, Float daysUntilDelivery, Integer currentRunningLooms, Float currentDailyCapacity, Float requiredDailyCapacity, Float additionalDailyCapacity, Float referenceDailyCapacity, Integer recommendedAdditionalLooms, Integer recommendedTotalLooms, OffsetDateTime estimatedCompletionDate, OffsetDateTime deliveryDate, Boolean meetsDeliveryDate) {
    this.remainingMeters = remainingMeters;
    this.daysUntilDelivery = daysUntilDelivery;
    this.currentRunningLooms = currentRunningLooms;
    this.currentDailyCapacity = currentDailyCapacity;
    this.requiredDailyCapacity = requiredDailyCapacity;
    this.additionalDailyCapacity = additionalDailyCapacity;
    this.referenceDailyCapacity = referenceDailyCapacity;
    this.recommendedAdditionalLooms = recommendedAdditionalLooms;
    this.recommendedTotalLooms = recommendedTotalLooms;
    this.estimatedCompletionDate = estimatedCompletionDate;
    this.deliveryDate = deliveryDate;
    this.meetsDeliveryDate = meetsDeliveryDate;
  }

  public ProductionAdvice remainingMeters(Integer remainingMeters) {
    this.remainingMeters = remainingMeters;
    return this;
  }

  /**
   * Metri ancora da produrre per completare l'articolo.
   * minimum: 0
   * @return remainingMeters
   */
  @NotNull @Min(value = 0) 
  @Schema(name = "remainingMeters", description = "Metri ancora da produrre per completare l'articolo.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("remainingMeters")
  public Integer getRemainingMeters() {
    return remainingMeters;
  }

  @JsonProperty("remainingMeters")
  public void setRemainingMeters(Integer remainingMeters) {
    this.remainingMeters = remainingMeters;
  }

  public ProductionAdvice daysUntilDelivery(Float daysUntilDelivery) {
    this.daysUntilDelivery = daysUntilDelivery;
    return this;
  }

  /**
   * Giorni disponibili fino alla data di consegna.
   * minimum: 0
   * @return daysUntilDelivery
   */
  @NotNull @DecimalMin(value = "0") 
  @Schema(name = "daysUntilDelivery", description = "Giorni disponibili fino alla data di consegna.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("daysUntilDelivery")
  public Float getDaysUntilDelivery() {
    return daysUntilDelivery;
  }

  @JsonProperty("daysUntilDelivery")
  public void setDaysUntilDelivery(Float daysUntilDelivery) {
    this.daysUntilDelivery = daysUntilDelivery;
  }

  public ProductionAdvice currentRunningLooms(Integer currentRunningLooms) {
    this.currentRunningLooms = currentRunningLooms;
    return this;
  }

  /**
   * Numero di telai attualmente in produzione per l'articolo.
   * minimum: 0
   * @return currentRunningLooms
   */
  @NotNull @Min(value = 0) 
  @Schema(name = "currentRunningLooms", description = "Numero di telai attualmente in produzione per l'articolo.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("currentRunningLooms")
  public Integer getCurrentRunningLooms() {
    return currentRunningLooms;
  }

  @JsonProperty("currentRunningLooms")
  public void setCurrentRunningLooms(Integer currentRunningLooms) {
    this.currentRunningLooms = currentRunningLooms;
  }

  public ProductionAdvice currentDailyCapacity(Float currentDailyCapacity) {
    this.currentDailyCapacity = currentDailyCapacity;
    return this;
  }

  /**
   * Capacita giornaliera complessiva dei telai attualmente in produzione, in metri.
   * minimum: 0
   * @return currentDailyCapacity
   */
  @NotNull @DecimalMin(value = "0") 
  @Schema(name = "currentDailyCapacity", description = "Capacita giornaliera complessiva dei telai attualmente in produzione, in metri.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("currentDailyCapacity")
  public Float getCurrentDailyCapacity() {
    return currentDailyCapacity;
  }

  @JsonProperty("currentDailyCapacity")
  public void setCurrentDailyCapacity(Float currentDailyCapacity) {
    this.currentDailyCapacity = currentDailyCapacity;
  }

  public ProductionAdvice requiredDailyCapacity(Float requiredDailyCapacity) {
    this.requiredDailyCapacity = requiredDailyCapacity;
    return this;
  }

  /**
   * Capacita giornaliera necessaria per completare l'articolo entro la consegna, in metri.
   * minimum: 0
   * @return requiredDailyCapacity
   */
  @NotNull @DecimalMin(value = "0") 
  @Schema(name = "requiredDailyCapacity", description = "Capacita giornaliera necessaria per completare l'articolo entro la consegna, in metri.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("requiredDailyCapacity")
  public Float getRequiredDailyCapacity() {
    return requiredDailyCapacity;
  }

  @JsonProperty("requiredDailyCapacity")
  public void setRequiredDailyCapacity(Float requiredDailyCapacity) {
    this.requiredDailyCapacity = requiredDailyCapacity;
  }

  public ProductionAdvice additionalDailyCapacity(Float additionalDailyCapacity) {
    this.additionalDailyCapacity = additionalDailyCapacity;
    return this;
  }

  /**
   * Capacita giornaliera aggiuntiva necessaria per rispettare la consegna, in metri.
   * minimum: 0
   * @return additionalDailyCapacity
   */
  @NotNull @DecimalMin(value = "0") 
  @Schema(name = "additionalDailyCapacity", description = "Capacita giornaliera aggiuntiva necessaria per rispettare la consegna, in metri.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("additionalDailyCapacity")
  public Float getAdditionalDailyCapacity() {
    return additionalDailyCapacity;
  }

  @JsonProperty("additionalDailyCapacity")
  public void setAdditionalDailyCapacity(Float additionalDailyCapacity) {
    this.additionalDailyCapacity = additionalDailyCapacity;
  }

  public ProductionAdvice referenceDailyCapacity(Float referenceDailyCapacity) {
    this.referenceDailyCapacity = referenceDailyCapacity;
    return this;
  }

  /**
   * Capacita giornaliera media dei telai in produzione, usata come riferimento per ciascun nuovo telaio.
   * minimum: 0
   * @return referenceDailyCapacity
   */
  @NotNull @DecimalMin(value = "0") 
  @Schema(name = "referenceDailyCapacity", description = "Capacita giornaliera media dei telai in produzione, usata come riferimento per ciascun nuovo telaio.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("referenceDailyCapacity")
  public Float getReferenceDailyCapacity() {
    return referenceDailyCapacity;
  }

  @JsonProperty("referenceDailyCapacity")
  public void setReferenceDailyCapacity(Float referenceDailyCapacity) {
    this.referenceDailyCapacity = referenceDailyCapacity;
  }

  public ProductionAdvice recommendedAdditionalLooms(Integer recommendedAdditionalLooms) {
    this.recommendedAdditionalLooms = recommendedAdditionalLooms;
    return this;
  }

  /**
   * Numero minimo di telai aggiuntivi consigliati per rispettare la consegna.
   * minimum: 0
   * @return recommendedAdditionalLooms
   */
  @NotNull @Min(value = 0) 
  @Schema(name = "recommendedAdditionalLooms", description = "Numero minimo di telai aggiuntivi consigliati per rispettare la consegna.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("recommendedAdditionalLooms")
  public Integer getRecommendedAdditionalLooms() {
    return recommendedAdditionalLooms;
  }

  @JsonProperty("recommendedAdditionalLooms")
  public void setRecommendedAdditionalLooms(Integer recommendedAdditionalLooms) {
    this.recommendedAdditionalLooms = recommendedAdditionalLooms;
  }

  public ProductionAdvice recommendedTotalLooms(Integer recommendedTotalLooms) {
    this.recommendedTotalLooms = recommendedTotalLooms;
    return this;
  }

  /**
   * Numero totale di telai consigliato, inclusi quelli gia in produzione.
   * minimum: 0
   * @return recommendedTotalLooms
   */
  @NotNull @Min(value = 0) 
  @Schema(name = "recommendedTotalLooms", description = "Numero totale di telai consigliato, inclusi quelli gia in produzione.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("recommendedTotalLooms")
  public Integer getRecommendedTotalLooms() {
    return recommendedTotalLooms;
  }

  @JsonProperty("recommendedTotalLooms")
  public void setRecommendedTotalLooms(Integer recommendedTotalLooms) {
    this.recommendedTotalLooms = recommendedTotalLooms;
  }

  public ProductionAdvice estimatedCompletionDate(OffsetDateTime estimatedCompletionDate) {
    this.estimatedCompletionDate = estimatedCompletionDate;
    return this;
  }

  /**
   * Data prevista di completamento mantenendo i soli telai attuali.
   * @return estimatedCompletionDate
   */
  @NotNull @Valid 
  @Schema(name = "estimatedCompletionDate", description = "Data prevista di completamento mantenendo i soli telai attuali.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("estimatedCompletionDate")
  public OffsetDateTime getEstimatedCompletionDate() {
    return estimatedCompletionDate;
  }

  @JsonProperty("estimatedCompletionDate")
  public void setEstimatedCompletionDate(OffsetDateTime estimatedCompletionDate) {
    this.estimatedCompletionDate = estimatedCompletionDate;
  }

  public ProductionAdvice deliveryDate(OffsetDateTime deliveryDate) {
    this.deliveryDate = deliveryDate;
    return this;
  }

  /**
   * Data di consegna dell'articolo.
   * @return deliveryDate
   */
  @NotNull @Valid 
  @Schema(name = "deliveryDate", description = "Data di consegna dell'articolo.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("deliveryDate")
  public OffsetDateTime getDeliveryDate() {
    return deliveryDate;
  }

  @JsonProperty("deliveryDate")
  public void setDeliveryDate(OffsetDateTime deliveryDate) {
    this.deliveryDate = deliveryDate;
  }

  public ProductionAdvice meetsDeliveryDate(Boolean meetsDeliveryDate) {
    this.meetsDeliveryDate = meetsDeliveryDate;
    return this;
  }

  /**
   * Indica se i telai attuali sono gia sufficienti a rispettare la consegna.
   * @return meetsDeliveryDate
   */
  @NotNull 
  @Schema(name = "meetsDeliveryDate", description = "Indica se i telai attuali sono gia sufficienti a rispettare la consegna.", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("meetsDeliveryDate")
  public Boolean getMeetsDeliveryDate() {
    return meetsDeliveryDate;
  }

  @JsonProperty("meetsDeliveryDate")
  public void setMeetsDeliveryDate(Boolean meetsDeliveryDate) {
    this.meetsDeliveryDate = meetsDeliveryDate;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ProductionAdvice productionAdvice = (ProductionAdvice) o;
    return Objects.equals(this.remainingMeters, productionAdvice.remainingMeters) &&
        Objects.equals(this.daysUntilDelivery, productionAdvice.daysUntilDelivery) &&
        Objects.equals(this.currentRunningLooms, productionAdvice.currentRunningLooms) &&
        Objects.equals(this.currentDailyCapacity, productionAdvice.currentDailyCapacity) &&
        Objects.equals(this.requiredDailyCapacity, productionAdvice.requiredDailyCapacity) &&
        Objects.equals(this.additionalDailyCapacity, productionAdvice.additionalDailyCapacity) &&
        Objects.equals(this.referenceDailyCapacity, productionAdvice.referenceDailyCapacity) &&
        Objects.equals(this.recommendedAdditionalLooms, productionAdvice.recommendedAdditionalLooms) &&
        Objects.equals(this.recommendedTotalLooms, productionAdvice.recommendedTotalLooms) &&
        Objects.equals(this.estimatedCompletionDate, productionAdvice.estimatedCompletionDate) &&
        Objects.equals(this.deliveryDate, productionAdvice.deliveryDate) &&
        Objects.equals(this.meetsDeliveryDate, productionAdvice.meetsDeliveryDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(remainingMeters, daysUntilDelivery, currentRunningLooms, currentDailyCapacity, requiredDailyCapacity, additionalDailyCapacity, referenceDailyCapacity, recommendedAdditionalLooms, recommendedTotalLooms, estimatedCompletionDate, deliveryDate, meetsDeliveryDate);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ProductionAdvice {\n");
    sb.append("    remainingMeters: ").append(toIndentedString(remainingMeters)).append("\n");
    sb.append("    daysUntilDelivery: ").append(toIndentedString(daysUntilDelivery)).append("\n");
    sb.append("    currentRunningLooms: ").append(toIndentedString(currentRunningLooms)).append("\n");
    sb.append("    currentDailyCapacity: ").append(toIndentedString(currentDailyCapacity)).append("\n");
    sb.append("    requiredDailyCapacity: ").append(toIndentedString(requiredDailyCapacity)).append("\n");
    sb.append("    additionalDailyCapacity: ").append(toIndentedString(additionalDailyCapacity)).append("\n");
    sb.append("    referenceDailyCapacity: ").append(toIndentedString(referenceDailyCapacity)).append("\n");
    sb.append("    recommendedAdditionalLooms: ").append(toIndentedString(recommendedAdditionalLooms)).append("\n");
    sb.append("    recommendedTotalLooms: ").append(toIndentedString(recommendedTotalLooms)).append("\n");
    sb.append("    estimatedCompletionDate: ").append(toIndentedString(estimatedCompletionDate)).append("\n");
    sb.append("    deliveryDate: ").append(toIndentedString(deliveryDate)).append("\n");
    sb.append("    meetsDeliveryDate: ").append(toIndentedString(meetsDeliveryDate)).append("\n");
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

