package com.projectmanagement.audit.util;

import com.projectmanagement.audit.entity.AuditLog;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class AuditCsvExporter {

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneOffset.UTC);

    private static final String[] HEADERS = {
            "Time", "Actor", "Action", "Resource", "Resource ID", "HTTP Method",
            "Path", "Status", "Success", "Error", "IP", "Duration (ms)"
    };

    private AuditCsvExporter() {}

    public static byte[] export(List<AuditLog> logs) {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(HEADERS)
                .setRecordSeparator("\r\n")
                .build();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(
                new OutputStreamWriter(out, StandardCharsets.UTF_8), format)) {
            for (AuditLog log : logs) {
                printer.printRecord(
                        TIME_FORMAT.format(log.getCreatedAt()),
                        log.getActor(),
                        log.getAction(),
                        log.getResource() != null ? log.getResource() : "",
                        log.getResourceId() != null ? log.getResourceId().toString() : "",
                        log.getHttpMethod() != null ? log.getHttpMethod() : "",
                        log.getPath() != null ? log.getPath() : "",
                        log.getStatusCode() != null ? log.getStatusCode().toString() : "",
                        log.isSuccess() ? "SUCCESS" : "FAILED",
                        log.getErrorMessage() != null ? log.getErrorMessage() : "",
                        log.getIpAddress() != null ? log.getIpAddress() : "",
                        log.getDurationMs() != null ? log.getDurationMs().toString() : ""
                );
            }
            printer.flush();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to generate CSV export", e);
        }
        return out.toByteArray();
    }
}