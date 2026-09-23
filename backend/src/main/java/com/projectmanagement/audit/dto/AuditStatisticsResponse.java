package com.projectmanagement.audit.dto;

import java.util.List;

public class AuditStatisticsResponse {

    private long totalEvents;
    private double successRate;
    private double avgDurationMs;
    private long last24hCount;
    private List<NameValue> byAction;
    private List<NameValue> byResource;
    private List<NameValue> topActors;
    private List<NameValue> dailyTrend;

    public AuditStatisticsResponse() {}

    public AuditStatisticsResponse(long totalEvents, double successRate, double avgDurationMs, long last24hCount,
                                   List<NameValue> byAction, List<NameValue> byResource,
                                   List<NameValue> topActors, List<NameValue> dailyTrend) {
        this.totalEvents = totalEvents;
        this.successRate = successRate;
        this.avgDurationMs = avgDurationMs;
        this.last24hCount = last24hCount;
        this.byAction = byAction;
        this.byResource = byResource;
        this.topActors = topActors;
        this.dailyTrend = dailyTrend;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(double successRate) {
        this.successRate = successRate;
    }

    public double getAvgDurationMs() {
        return avgDurationMs;
    }

    public void setAvgDurationMs(double avgDurationMs) {
        this.avgDurationMs = avgDurationMs;
    }

    public long getLast24hCount() {
        return last24hCount;
    }

    public void setLast24hCount(long last24hCount) {
        this.last24hCount = last24hCount;
    }

    public List<NameValue> getByAction() {
        return byAction;
    }

    public void setByAction(List<NameValue> byAction) {
        this.byAction = byAction;
    }

    public List<NameValue> getByResource() {
        return byResource;
    }

    public void setByResource(List<NameValue> byResource) {
        this.byResource = byResource;
    }

    public List<NameValue> getTopActors() {
        return topActors;
    }

    public void setTopActors(List<NameValue> topActors) {
        this.topActors = topActors;
    }

    public List<NameValue> getDailyTrend() {
        return dailyTrend;
    }

    public void setDailyTrend(List<NameValue> dailyTrend) {
        this.dailyTrend = dailyTrend;
    }
}