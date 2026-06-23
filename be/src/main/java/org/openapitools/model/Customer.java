package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.openapitools.model.Item;
import org.openapitools.model.Referent;
import org.springframework.lang.Nullable;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * Customer
 */

@JsonTypeName("customer")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-06-23T17:29:03.911191800+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Customer {

  private @Nullable String id;

  private String name;

  @Valid
  private List<@Valid Referent> referents = new ArrayList<>();

  @Valid
  private List<@Valid Item> items = new ArrayList<>();

  private @Nullable String note;

  private String email;

  public Customer() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Customer(String name, String email) {
    this.name = name;
    this.email = email;
  }

  public Customer id(@Nullable String id) {
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

  public Customer name(String name) {
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

  public Customer referents(List<@Valid Referent> referents) {
    this.referents = referents;
    return this;
  }

  public Customer addReferentsItem(Referent referentsItem) {
    if (this.referents == null) {
      this.referents = new ArrayList<>();
    }
    this.referents.add(referentsItem);
    return this;
  }

  /**
   * Get referents
   * @return referents
   */
  @Valid 
  @Schema(name = "referents", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("referents")
  public List<@Valid Referent> getReferents() {
    return referents;
  }

  @JsonProperty("referents")
  public void setReferents(List<@Valid Referent> referents) {
    this.referents = referents;
  }

  public Customer items(List<@Valid Item> items) {
    this.items = items;
    return this;
  }

  public Customer addItemsItem(Item itemsItem) {
    if (this.items == null) {
      this.items = new ArrayList<>();
    }
    this.items.add(itemsItem);
    return this;
  }

  /**
   * Get items
   * @return items
   */
  @Valid 
  @Schema(name = "items", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("items")
  public List<@Valid Item> getItems() {
    return items;
  }

  @JsonProperty("items")
  public void setItems(List<@Valid Item> items) {
    this.items = items;
  }

  public Customer note(@Nullable String note) {
    this.note = note;
    return this;
  }

  /**
   * Get note
   * @return note
   */
  
  @Schema(name = "note", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("note")
  public @Nullable String getNote() {
    return note;
  }

  @JsonProperty("note")
  public void setNote(@Nullable String note) {
    this.note = note;
  }

  public Customer email(String email) {
    this.email = email;
    return this;
  }

  /**
   * Get email
   * @return email
   */
  @NotNull 
  @Schema(name = "email", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("email")
  public String getEmail() {
    return email;
  }

  @JsonProperty("email")
  public void setEmail(String email) {
    this.email = email;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Customer customer = (Customer) o;
    return Objects.equals(this.id, customer.id) &&
        Objects.equals(this.name, customer.name) &&
        Objects.equals(this.referents, customer.referents) &&
        Objects.equals(this.items, customer.items) &&
        Objects.equals(this.note, customer.note) &&
        Objects.equals(this.email, customer.email);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, name, referents, items, note, email);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Customer {\n");
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    referents: ").append(toIndentedString(referents)).append("\n");
    sb.append("    items: ").append(toIndentedString(items)).append("\n");
    sb.append("    note: ").append(toIndentedString(note)).append("\n");
    sb.append("    email: ").append(toIndentedString(email)).append("\n");
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

