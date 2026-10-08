package org.openapitools.model;

public class AssignedProcessResponse {
    private final Process process;
    private final LoomItemAssignment assignment;
    private final Item item;

    public AssignedProcessResponse(Process process, LoomItemAssignment assignment, Item item) {
        this.process = process;
        this.assignment = assignment;
        this.item = item;
    }

    public Process getProcess() {
        return process;
    }

    public LoomItemAssignment getAssignment() {
        return assignment;
    }

    public Item getItem() {
        return item;
    }
}
