package org.openapitools.domain;

import java.math.BigDecimal;
import org.openapitools.model.RatePricingType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Document(collection = "rates")
public class RateEntity {
    @Id private String id;
    private String serviceId;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal minimum;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal maximum;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal hours;

    public BigDecimal getHours() {
        return hours;
    }

    public void setHours(BigDecimal hours) {
        this.hours = hours;
    }

    private RatePricingType pricingType;
    private String description;

    public RatePricingType getPricingType() {
        return pricingType == null ? RatePricingType.FIXED : pricingType;
    }

    public void setPricingType(RatePricingType pricingType) {
        this.pricingType = pricingType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public BigDecimal getMinimum() {
        return minimum;
    }

    public void setMinimum(BigDecimal minimum) {
        this.minimum = minimum;
    }

    public BigDecimal getMaximum() {
        return maximum;
    }

    public void setMaximum(BigDecimal maximum) {
        this.maximum = maximum;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
