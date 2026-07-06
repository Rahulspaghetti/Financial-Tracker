package com.tally.finance.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();

    @Column(name = "plaid_account_id", nullable = false, unique = true)
    private String plaidAccountId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plaid_item_id", nullable = false)
    private PlaidItem plaidItem;

    @Column(nullable = false)
    private String name;

    @Column(name = "official_name")
    private String officialName;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 50)
    private String subtype;

    @Column(name = "balance_current", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceCurrent = BigDecimal.ZERO;

    @Column(name = "balance_available", precision = 15, scale = 2)
    private BigDecimal balanceAvailable;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "USD";

    @Column(name = "institution_name")
    private String institutionName;

    @Column(name = "institution_logo", length = 1024)
    private String institutionLogo;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();

    public String getId() { return id; }
    public String getPlaidAccountId() { return plaidAccountId; }
    public void setPlaidAccountId(String plaidAccountId) { this.plaidAccountId = plaidAccountId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public PlaidItem getPlaidItem() { return plaidItem; }
    public void setPlaidItem(PlaidItem plaidItem) { this.plaidItem = plaidItem; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getOfficialName() { return officialName; }
    public void setOfficialName(String officialName) { this.officialName = officialName; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSubtype() { return subtype; }
    public void setSubtype(String subtype) { this.subtype = subtype; }
    public BigDecimal getBalanceCurrent() { return balanceCurrent; }
    public void setBalanceCurrent(BigDecimal balanceCurrent) { this.balanceCurrent = balanceCurrent; }
    public BigDecimal getBalanceAvailable() { return balanceAvailable; }
    public void setBalanceAvailable(BigDecimal balanceAvailable) { this.balanceAvailable = balanceAvailable; }
    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getInstitutionLogo() { return institutionLogo; }
    public void setInstitutionLogo(String institutionLogo) { this.institutionLogo = institutionLogo; }
    public Instant getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
