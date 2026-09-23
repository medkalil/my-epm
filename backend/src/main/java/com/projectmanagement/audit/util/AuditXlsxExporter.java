package com.projectmanagement.audit.util;

import com.projectmanagement.audit.entity.AuditLog;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class AuditXlsxExporter {

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneOffset.UTC);

    private static final String[] HEADERS = {
            "Time", "Actor", "Action", "Resource", "Resource ID", "HTTP Method",
            "Path", "Status", "Success", "Error", "IP", "Duration (ms)"
    };

    private AuditXlsxExporter() {}

    public static byte[] export(List<AuditLog> logs) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit Logs");

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (AuditLog log : logs) {
                Row row = sheet.createRow(rowIndex++);
                setStringCell(row, 0, TIME_FORMAT.format(log.getCreatedAt()));
                setStringCell(row, 1, log.getActor());
                setStringCell(row, 2, log.getAction());
                setStringCell(row, 3, log.getResource());
                setStringCell(row, 4, log.getResourceId());
                setStringCell(row, 5, log.getHttpMethod());
                setStringCell(row, 6, log.getPath());
                setStringCell(row, 7, log.getStatusCode());
                setStringCell(row, 8, log.isSuccess() ? "SUCCESS" : "FAILED");
                setStringCell(row, 9, log.getErrorMessage());
                setStringCell(row, 10, log.getIpAddress());
                setStringCell(row, 11, log.getDurationMs());
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to generate XLSX export", e);
        }
    }

    private static void setStringCell(Row row, int index, Object value) {
        Cell cell = row.createCell(index);
        cell.setCellValue(value != null ? String.valueOf(value) : "");
    }
}