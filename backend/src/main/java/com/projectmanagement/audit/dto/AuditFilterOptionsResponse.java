package com.projectmanagement.audit.dto;

import java.util.List;

public class AuditFilterOptionsResponse {

    private List<String> actors;
    private List<String> actions;
    private List<String> resources;

    public AuditFilterOptionsResponse() {}

    public AuditFilterOptionsResponse(List<String> actors, List<String> actions, List<String> resources) {
        this.actors = actors;
        this.actions = actions;
        this.resources = resources;
    }

    public List<String> getActors() {
        return actors;
    }

    public void setActors(List<String> actors) {
        this.actors = actors;
    }

    public List<String> getActions() {
        return actions;
    }

    public void setActions(List<String> actions) {
        this.actions = actions;
    }

    public List<String> getResources() {
        return resources;
    }

    public void setResources(List<String> resources) {
        this.resources = resources;
    }
}