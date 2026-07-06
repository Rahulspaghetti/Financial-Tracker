package com.tally.finance.api.dto;

public record SyncResponse(int transactionsSynced, String message) {
    public SyncResponse(int transactionsSynced) {
        this(transactionsSynced, "Sync completed");
    }
}
