package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ZenditService {

    @Value("${zendit.api.key:sand_39f37bfb-25f7-4de4-9564-024003cde0d46a2b28a84063e9f8a9c79227}")
    private String zenditApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Random random = new Random();

    private static final Map<String, String> PLAN_ZENDIT_OFFER_MAP = Map.of(
        "oseikrom_daily", "ESIM-GH-1D-ULE-NOROAM",
        "accra_unlimited", "ESIM-GH-7D-UNLIMITED-NOROAM",
        "gold_coast_monthly", "ESIM-GH-30D-50GB-NOROAM"
    );

    // Country fallback data for when Zendit has no offers
    private static final Map<String, Map<String, Object>> COUNTRY_DATA = new LinkedHashMap<>();

    static {
        COUNTRY_DATA.put("US", mkCountry("United States", "🇺🇸", "New York", "5G Extreme", "hub", "Silicon Alley Priority", "Transatlantic lightning fiber routing via New York Edge Nodes."));
        COUNTRY_DATA.put("GB", mkCountry("United Kingdom", "🇬🇧", "London", "5G Multi-Carrier", "public", "Prime Greenwich Link", "Symmetrical routing via UK's leading dual-carrier fiber networks."));
        COUNTRY_DATA.put("JP", mkCountry("Japan", "🇯🇵", "Tokyo", "5G Ultra-Dense", "electric_bolt", "Shinjuku Zen Flow", "Millimeter-wave coverage optimized for hyper-density and bullet trains."));
        COUNTRY_DATA.put("ZA", mkCountry("South Africa", "🇿🇦", "Cape Town", "4G/5G High Capacity", "sailing", "Table Mountain Ubuntu Mesh", "Distributed, community-anchored redundancy with beautiful coastline reception."));
        COUNTRY_DATA.put("GH", mkCountry("Ghana", "🇬🇭", "Accra", "5G Core", "all_inclusive", "Greater Accra Unlimited", "Adinkra-inspired high-speed core fiber network in heavy traffic hubs."));
        COUNTRY_DATA.put("CA", mkCountry("Canada", "🇨🇦", "Toronto", "5G Wild-Range", "forest", "Great Maple Link", "High-penetration spectrum designed for deep-forest trails and major metro blocks."));
        COUNTRY_DATA.put("DE", mkCountry("Germany", "🇩🇪", "Berlin", "5G Autobahn Speed", "directions_car", "Berlin Kreuzberg Net", "Advanced high-bandwidth channels for seamless roaming across all German states."));
        COUNTRY_DATA.put("FR", mkCountry("France", "🇫🇷", "Paris", "5G Chic", "palette", "Seine Art routing", "High artistic aesthetic and dual-channel failover across all historical landmarks."));
        COUNTRY_DATA.put("NG", mkCountry("Nigeria", "🇳🇬", "Lagos", "5G Smart", "token", "Lagos Eko Wave", "Hyper-speed spectrum covering key financial corridors, mainland, and islands."));
    }

    private static Map<String, Object> mkCountry(String name, String flag, String city, String speed,
                                                   String symbol, String title, String desc) {
        Map<String, Object> m = new HashMap<>();
        m.put("countryName", name);
        m.put("flag", flag);
        m.put("city", city);
        m.put("speed", speed);
        m.put("symbol", symbol);
        m.put("title", title);
        m.put("desc", desc);
        return m;
    }

    public ZenditService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> provisionEsim(String reference, String planId) {
        String offerId = planId.startsWith("ESIM-") ? planId
            : PLAN_ZENDIT_OFFER_MAP.getOrDefault(planId, "ESIM-GH-30D-5GB-NOROAM");

        System.out.println("[Zendit Provisioning] Purchasing Offer: " + offerId + " for transaction: " + reference);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(zenditApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            ObjectNode body = mapper.createObjectNode();
            body.put("offerId", offerId);
            body.put("transactionId", reference);
            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(body), headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                "https://api.zendit.io/v1/esim/purchases", entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode zenditData = response.getBody();
                // Poll if still pending
                int attempts = 0;
                while (attempts < 5 && isStillPending(zenditData)) {
                    System.out.println("[Zendit Polling] Status: " + zenditData.path("status").asText() + ", attempt " + (attempts + 1));
                    Thread.sleep(1500);
                    attempts++;
                    HttpEntity<Void> getEntity = new HttpEntity<>(headers);
                    ResponseEntity<JsonNode> getRes = restTemplate.exchange(
                        "https://api.zendit.io/v1/esim/purchases/" + reference,
                        HttpMethod.GET, getEntity, JsonNode.class);
                    if (getRes.getStatusCode().is2xxSuccessful() && getRes.getBody() != null) {
                        zenditData = getRes.getBody();
                    }
                }

                JsonNode confirmation = zenditData.path("confirmation");
                if (!confirmation.isMissingNode()) {
                    String iccid = confirmation.path("iccid").asText();
                    String smdp = confirmation.path("smdpAddress").asText();
                    String activation = confirmation.path("activationCode").asText();
                    Map<String, Object> result = new HashMap<>();
                    result.put("iccid", iccid);
                    result.put("qrCodeUrl", "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LPA:1$" + smdp + "$" + activation);
                    result.put("activationCode", activation);
                    result.put("smdpAddress", smdp);
                    result.put("isRealEsim", true);
                    System.out.println("[Zendit Success] iccid=" + iccid);
                    return result;
                }
                System.out.println("[Zendit No Confirmation] status=" + zenditData.path("status").asText());
            }
        } catch (Exception e) {
            System.out.println("[eSIM Provisioning Info] Zendit error or offline. Falling back. Details: " + e.getMessage());
        }

        return mockEsimProfile();
    }

    public Map<String, Object> listEsims() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(zenditApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                "https://api.zendit.io/v1/esim/purchases?_limit=20&_offset=0",
                HttpMethod.GET, entity, JsonNode.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Zendit error: " + response.getStatusCode());
            }

            JsonNode data = response.getBody();
            List<Map<String, Object>> esims = new ArrayList<>();
            JsonNode list = data.path("list");
            if (list.isArray()) {
                for (JsonNode p : list) {
                    boolean isUnlimited = p.path("dataUnlimited").asBoolean(false)
                        || p.path("offerId").asText("").contains("UNLIMITED")
                        || p.path("offerId").asText("").contains("UL");
                    int dataGb = p.path("dataGB").asInt(5);
                    String totalGb = isUnlimited ? "Unlimited Data" : dataGb + " GB";
                    double leftGb = isUnlimited ? 50.0 : dataGb;

                    String iccid = p.path("confirmation").path("iccid").asText(
                        "89233010" + (100000000000L + (long)(random.nextDouble() * 900000000000L)));
                    String txId = p.path("transactionId").asText("");
                    String id = txId.isBlank() ? "#GH-2026-" + randomAlphaNum(3).toUpperCase() : "#" + txId;
                    String status = List.of("DONE", "ACCEPTED", "IN_PROGRESS").contains(p.path("status").asText(""))
                        ? "active" : "completed";

                    Map<String, Object> esim = new HashMap<>();
                    esim.put("id", id);
                    esim.put("planName", p.path("brandName").asText("Zendit eSIM " + (isUnlimited ? "Unlimited" : dataGb + "GB")));
                    esim.put("status", status);
                    esim.put("totalDataGb", totalGb);
                    esim.put("leftDataGb", leftGb);
                    esim.put("expiresInDays", p.path("durationDays").asInt(30));
                    esim.put("iccid", iccid);

                    String smdp = p.path("confirmation").path("smdpAddress").asText(null);
                    String activation = p.path("confirmation").path("activationCode").asText(null);
                    if (activation != null) {
                        esim.put("activationCode", activation);
                        esim.put("smdpAddress", smdp);
                        if (smdp != null) {
                            esim.put("qrCodeUrl", "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LPA:1$" + smdp + "$" + activation);
                        }
                    }
                    esims.add(esim);
                }
            }
            return Map.of("success", true, "esims", esims);
        } catch (Exception e) {
            System.out.println("[Zendit list eSIMs failed] " + e.getMessage());
            return Map.of("success", false, "esims", List.of());
        }
    }

    public Map<String, Object> getOffers(String country) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(zenditApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                "https://api.zendit.io/v1/esim/offers?_limit=100&_offset=0&country=" + country,
                HttpMethod.GET, entity, JsonNode.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Zendit error: " + response.getStatusCode());
            }

            JsonNode data = response.getBody();
            List<Map<String, Object>> plans = new ArrayList<>();
            JsonNode offersList = data.path("list");
            if (offersList.isArray()) {
                for (JsonNode o : offersList) {
                    if (!o.path("enabled").asBoolean(true)) continue;

                    boolean isUnlimited = o.path("dataUnlimited").asBoolean(false);
                    int dataGbVal = o.path("dataGB").asInt(5);
                    String dataStr = isUnlimited ? "Unlimited Data"
                        : (dataGbVal == 0 ? "Unlimited (Throttled)" : dataGbVal + " GB");

                    int days = o.path("durationDays").asInt(30);
                    String name;
                    if ("GH".equals(country)) {
                        if (days == 1) name = "Kumasi Flash Daily (" + dataStr + ")";
                        else if (days == 3) name = "Oseikrom Express (" + dataStr + ")";
                        else if (days == 7) name = "Greater Accra Weekly (" + dataStr + ")";
                        else if (days == 15) name = "Volta Heritage Fortnight (" + dataStr + ")";
                        else if (days == 30) name = "Gold Coast Monthly (" + dataStr + ")";
                        else name = "Ghana Explorer " + days + "D (" + dataStr + ")";
                    } else {
                        JsonNode regions = o.path("regions");
                        String region = regions.isArray() && regions.size() > 0 ? regions.get(0).asText(country) : country;
                        name = region + " Day Pass (" + dataStr + ")";
                    }

                    String tag = isUnlimited ? "Unlimited Value"
                        : days >= 30 ? "Nomad Tier"
                        : days == 7 ? "Best Value"
                        : days == 1 ? "Popular"
                        : "Standard Pack";

                    JsonNode priceNode = o.path("price");
                    double priceUsd = priceNode.path("fixed").asDouble(500) / priceNode.path("currencyDivisor").asDouble(100);
                    priceUsd = Math.round(priceUsd * 100.0) / 100.0;
                    int priceGhs = (int) Math.round(priceUsd * 13.5);

                    // Cultural insight based on offer ID hash
                    String offerId = o.path("offerId").asText("x");
                    int hashIdx = offerId.chars().sum();
                    String[][] insights = {
                        {"Divine Sovereignty Link (Except God / Gye Nyame)", "verified", "Signifying supremacy and ultimate trust. This plan ensures secure network core routing across the nation."},
                        {"Reconciliation Node (Knot of Peace / Mpatapo)", "all_inclusive", "The knot of reconciliation and peacemaking. Bind yourself securely to high frequency network terminals."},
                        {"Eagle's Claw Strength (Okodee Mmowere)", "local_fire_department", "The fierce grip of the eagle's claws, signifying strength and determination on high-speed 5G nodes."},
                        {"Heritage Retrieval Latency (Sankofa)", "history", "Go back and retrieve your roots. Optimized legacy data pathways for retrofitting modern workflows."},
                        {"Smart Spider-Web Grid (Ananse)", "share", "The spider's legendary web of wisdom and craft. Entangle yourself in a perfect grid of premium fiber backhaul nodes."}
                    };
                    String[] insight = insights[hashIdx % insights.length];

                    JsonNode speedsNode = o.path("dataSpeeds");
                    String speed = speedsNode.isArray() && speedsNode.size() > 0
                        ? streamJoin(speedsNode, "/") : "5G Super Speed";

                    Map<String, Object> plan = new HashMap<>();
                    plan.put("id", offerId);
                    plan.put("name", name);
                    plan.put("tag", tag);
                    plan.put("priceGhs", priceGhs);
                    plan.put("priceUsd", priceUsd);
                    plan.put("speed", speed);
                    plan.put("dataGb", dataStr);
                    plan.put("validityDays", days);
                    plan.put("culturalInsightTitle", insight[0]);
                    plan.put("culturalInsightSymbolName", insight[1]);
                    plan.put("culturalInsightDesc", o.path("notes").asText(insight[2]));
                    plans.add(plan);
                }
            }

            if (plans.isEmpty()) {
                return Map.of("success", true, "plans", generateFallbackPlans(country));
            }
            return Map.of("success", true, "plans", plans);

        } catch (Exception e) {
            System.out.println("[Zendit get offers failed] " + e.getMessage());
            return Map.of("success", true, "plans", generateFallbackPlans(country));
        }
    }

    private List<Map<String, Object>> generateFallbackPlans(String country) {
        Map<String, Object> picked = COUNTRY_DATA.getOrDefault(country.toUpperCase(), Map.of(
            "countryName", "Country (" + country + ")",
            "flag", "🌐",
            "city", "Capital Core",
            "speed", "5G/LTE Global",
            "symbol", "explore",
            "title", "Global Wanderer Link",
            "desc", "Multi-network connectivity automatically pairing with local premium carriers."
        ));

        List<Map<String, Object>> plans = new ArrayList<>();
        plans.add(makePlan(country, "1D-QL", picked.get("flag") + " " + picked.get("city") + " 1-Day Flash Pass", "Popular", 5.0, "2 GB", 1, picked));
        plans.add(makePlan(country, "7D-NV", picked.get("flag") + " " + picked.get("countryName") + " Weekly Nomad", "Best Value", 15.0, "10 GB", 7, picked));
        plans.add(makePlan(country, "30D-UL", picked.get("flag") + " " + picked.get("countryName") + " Elite Monthly", "Unlimited Value", 45.0, "Unlimited Data", 30, picked));
        return plans;
    }

    private Map<String, Object> makePlan(String country, String suffix, String name, String tag,
                                          double priceUsd, String dataGb, int days, Map<String, Object> picked) {
        Map<String, Object> plan = new HashMap<>();
        plan.put("id", "ESIM-" + country.toUpperCase() + "-" + suffix);
        plan.put("name", name);
        plan.put("tag", tag);
        plan.put("priceGhs", (int) Math.round(priceUsd * 13.5));
        plan.put("priceUsd", priceUsd);
        plan.put("speed", picked.get("speed"));
        plan.put("dataGb", dataGb);
        plan.put("validityDays", days);
        plan.put("culturalInsightTitle", picked.get("title"));
        plan.put("culturalInsightSymbolName", picked.get("symbol"));
        plan.put("culturalInsightDesc", picked.get("desc"));
        return plan;
    }

    private Map<String, Object> mockEsimProfile() {
        long mockIccid = 8923301000000000000L + Math.abs(random.nextLong() % 900000000000L);
        String iccid = String.valueOf(mockIccid);
        Map<String, Object> result = new HashMap<>();
        result.put("iccid", iccid);
        result.put("qrCodeUrl", "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LPA:1$rsp.zendit.io$" + iccid);
        result.put("activationCode", "1$rsp.zendit.io$" + iccid);
        result.put("smdpAddress", "rsp.zendit.io");
        result.put("isRealEsim", false);
        return result;
    }

    private boolean isStillPending(JsonNode data) {
        String status = data.path("status").asText("");
        return data.path("confirmation").isMissingNode()
            && (status.equals("ACCEPTED") || status.equals("PENDING") || status.isEmpty());
    }

    private String streamJoin(JsonNode arrayNode, String sep) {
        List<String> parts = new ArrayList<>();
        for (JsonNode n : arrayNode) parts.add(n.asText());
        return String.join(sep, parts);
    }

    private String randomAlphaNum(int len) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < len; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }
}
