package org.openapitools.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class CreateAssignedProcessRequest {
    @NotNull @Valid private Process process;

    public Process getProcess() {
        return process;
    }

    public void setProcess(Process process) {
        this.process = process;
    }
}
