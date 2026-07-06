package com.tally.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TallyApiApplication {

    static {
        // Plaid (OkHttp) uses the JVM trust store; on Windows the bundled cacerts
        // often misses certs that Edge/Chrome trust via the OS store.
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win") && System.getProperty("javax.net.ssl.trustStoreType") == null) {
            System.setProperty("javax.net.ssl.trustStoreType", "Windows-ROOT");
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(TallyApiApplication.class, args);
    }
}
