package org.openapitools.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.openapitools.model.User;
import org.springframework.lang.Nullable;
import org.openapitools.jackson.nullable.JsonNullable;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * Login200Response
 */

@JsonTypeName("login_200_response")
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-07-15T12:18:51.296312700+02:00[Europe/Rome]", comments = "Generator version: 7.22.0")
public class Login200Response {

  private String token;

  private @Nullable String tokenType;

  private @Nullable User user;

  public Login200Response() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public Login200Response(String token) {
    this.token = token;
  }

  public Login200Response token(String token) {
    this.token = token;
    return this;
  }

  /**
   * Token di autenticazione da usare nelle richieste successive
   * @return token
   */
  @NotNull 
  @Schema(name = "token", description = "Token di autenticazione da usare nelle richieste successive", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("token")
  public String getToken() {
    return token;
  }

  @JsonProperty("token")
  public void setToken(String token) {
    this.token = token;
  }

  public Login200Response tokenType(@Nullable String tokenType) {
    this.tokenType = tokenType;
    return this;
  }

  /**
   * Get tokenType
   * @return tokenType
   */
  
  @Schema(name = "tokenType", example = "Bearer", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("tokenType")
  public @Nullable String getTokenType() {
    return tokenType;
  }

  @JsonProperty("tokenType")
  public void setTokenType(@Nullable String tokenType) {
    this.tokenType = tokenType;
  }

  public Login200Response user(@Nullable User user) {
    this.user = user;
    return this;
  }

  /**
   * Get user
   * @return user
   */
  @Valid 
  @Schema(name = "user", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("user")
  public @Nullable User getUser() {
    return user;
  }

  @JsonProperty("user")
  public void setUser(@Nullable User user) {
    this.user = user;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Login200Response login200Response = (Login200Response) o;
    return Objects.equals(this.token, login200Response.token) &&
        Objects.equals(this.tokenType, login200Response.tokenType) &&
        Objects.equals(this.user, login200Response.user);
  }

  @Override
  public int hashCode() {
    return Objects.hash(token, tokenType, user);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Login200Response {\n");
    sb.append("    token: ").append(toIndentedString(token)).append("\n");
    sb.append("    tokenType: ").append(toIndentedString(tokenType)).append("\n");
    sb.append("    user: ").append(toIndentedString(user)).append("\n");
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

