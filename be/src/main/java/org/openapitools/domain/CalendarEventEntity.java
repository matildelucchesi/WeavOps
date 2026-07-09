package org.openapitools.domain;

import org.openapitools.model.CalendarEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "calendar-event")
public class CalendarEventEntity {
    @Id
    private String id;

    String description;
    String eventType;
    Instant date;
    CalendarEvent.ImportanceEnum importance;
    String assignmentId;
    String loomId;
    String processId;
    String itemId;
    String arrangementId;

    //getter & setter
    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getArrangementId() {
        return arrangementId;
    }

    public void setArrangementId(String arrangementId) {
        this.arrangementId = arrangementId;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getProcessId() {
        return processId;
    }

    public void setProcessId(String processId) {
        this.processId = processId;
    }

    public String getLoomId() {
        return loomId;
    }

    public void setLoomId(String loomId) {
        this.loomId = loomId;
    }

    public String getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(String assignmentId) {
        this.assignmentId = assignmentId;
    }

    public CalendarEvent.ImportanceEnum getImportance() {
        return importance;
    }

    public void setImportance(CalendarEvent.ImportanceEnum importance) {
        this.importance = importance;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
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
}
