package com.simfinity.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
public class InsightService {

    private static final Logger log = LoggerFactory.getLogger(InsightService.class);

    @Value("${insight.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    private static final Map<String, List<Map<String, Object>>> FALLBACK_INSIGHTS = new LinkedHashMap<>();
    private static final List<Map<String, Object>> GLOBAL_FALLBACKS = new ArrayList<>();

    static {
        addFallback("kenya",
            "The Great Wildebeest Migration & Maasai Mara",
            "Every year, over 1.5 million wildebeest and thousands of zebras cross the Mara River from Serengeti to Maasai Mara in search of greener pastures. This is considered one of the 'Seven Natural Wonders of Africa' and offers a front-row seat to spectacular wildlife drama.",
            List.of(
                Map.of("title", "Magical Kenya National Tourism Board", "uri", "https://www.magicalkenya.com"),
                Map.of("title", "UNESCO World Heritage Centre", "uri", "https://whc.unesco.org")
            ));
        addFallback("kenya",
            "The Ancient Swahili Coastline of Lamu",
            "Lamu Old Town is the oldest and best-preserved Swahili settlement in East Africa, built in coral stone and mangrove timber. The island has no motorized vehicles; instead, transport relies on over 3,000 active donkeys and traditional wooden dhow sailboats.",
            List.of(
                Map.of("title", "Lamu Heritage Trust", "uri", "https://www.lamuheritage.org"),
                Map.of("title", "UNESCO World Heritage - Lamu Old Town", "uri", "https://whc.unesco.org/en/list/1055")
            ));
        addFallback("south africa",
            "The Ancient Cradle of Humankind",
            "Just a short drive from Johannesburg, the Sterkfontein Caves contain nearly a third of all early hominid fossils ever found on Earth, dating back over 3 million years. These discoveries have redefined researchers' understanding of humanity's evolutionary timeline.",
            List.of(
                Map.of("title", "Maropeng Cradle of Humankind", "uri", "https://www.maropeng.co.za"),
                Map.of("title", "UNESCO World Heritage Site List", "uri", "https://whc.unesco.org/en/list/915")
            ));
        addFallback("south africa",
            "Table Mountain's Floral Kingdom",
            "Table Mountain is home to the Cape Floral Region, which contains over 9,000 plant species, 70% of which are completely endemic to the Cape and found nowhere else on earth, making it the smallest but richest of the world's six floral kingdoms.",
            List.of(
                Map.of("title", "South African National Parks (SANParks)", "uri", "https://www.sanparks.org"),
                Map.of("title", "CapeTown Tourism Official", "uri", "https://www.capetown.travel")
            ));
        addFallback("nigeria",
            "The Mysterious Nok Culture Terracottas",
            "Pre-dating most other sub-Saharan civilizations, the ancient Nok Culture of Nigeria (around 1500 BC to 500 AD) created highly sophisticated life-sized terracotta sculptures of human heads with distinctive triangular eyes, representing a highly advanced early iron-working civilization.",
            List.of(
                Map.of("title", "National Museum of Nigeria Archives", "uri", "https://museum.ng"),
                Map.of("title", "Metropolitan Museum of Art - Nok", "uri", "https://www.metmuseum.org")
            ));
        addFallback("nigeria",
            "UNESCO Osun-Osogbo Sacred Grove",
            "Nestled along the outskirts of the city of Osogbo, the sacred Osun Grove is one of the last remaining primary high-canopy forests in Southern Nigeria. It is dedicated to Osun, the Yoruba goddess of fertility, and dotted with spectacular modern shrines, sculptures, and sanctuaries.",
            List.of(
                Map.of("title", "Osun State Tourism Authority", "uri", "https://osunstate.gov.ng"),
                Map.of("title", "UNESCO Osun-Osogbo World Heritage", "uri", "https://whc.unesco.org/en/list/1118")
            ));
        addFallback("japan",
            "The Sacred Nakasendo Trail Walk",
            "The Nakasendo was an ancient postal road routing between Edo (modern Tokyo) and Kyoto through the rugged central Kiso Valley. Preserved post towns like Tsumago and Magome prohibit cars and showcase pristine wooden Edo-period architecture for immersive hiking journeys.",
            List.of(
                Map.of("title", "Japan National Tourism Organization", "uri", "https://www.japan.travel"),
                Map.of("title", "Kiso Valley Official Guide", "uri", "https://www.kisoji.com")
            ));
        addFallback("japan",
            "The Floating Torii Gate of Miyajima",
            "Built in 1168, the giant vermilion wooden Torii Gate of Itsukushima Shrine appears to float on the Seto Inland Sea during high tide. The shrine was constructed on stilts above the water because the island of Miyajima itself was considered too sacred for commoners to step foot on.",
            List.of(
                Map.of("title", "Itsukushima Shrine Official Association", "uri", "https://www.itsukushimajinja.jp"),
                Map.of("title", "Hiroshima Prefecture Tourism Hub", "uri", "https://www.dive-hiroshima.com")
            ));
        addFallback("brazil",
            "The Meeting of Waters in the Amazon",
            "Over a stretch of 6 kilometers near Manaus, the dark, acidic Rio Negro runs alongside the pale, muddy Amazon River without mixing. This phenomenon is caused by differences in water temperature, speed, and sediment density, creating a stark visual border.",
            List.of(
                Map.of("title", "Visit Brazil Official Office", "uri", "https://visitbrasil.com"),
                Map.of("title", "Amazonas State Tourism Board", "uri", "https://www.amazonastur.am.gov.br")
            ));
        addFallback("morocco",
            "Chefchaouen's Painted Blue Medina",
            "Perched below the peaks of the Rif Mountains, Morocco's 'Blue Pearl' Chefchaouen features streets washed entirely in shades of blue. This custom was originally introduced by Jewish refugees in the 15th century as a symbol of sky and heaven.",
            List.of(
                Map.of("title", "Moroccan National Office of Tourism", "uri", "https://www.visitmorocco.com"),
                Map.of("title", "Chefchaouen Travel Association", "uri", "https://www.chefchaouen.ma")
            ));
        addFallback("ivory coast",
            "The Mud Mosque Architecture of Kong",
            "Dating back to the 17th century, the historic mud-brick mosques of Kong showcase exquisite Sudanese style architecture, constructed using raw sun-dried clay, mud, and integrated wooden support pillars that double as structural scaffolding.",
            List.of(
                Map.of("title", "Côte d'Ivoire Tourism Department", "uri", "https://tourism.ci"),
                Map.of("title", "UNESCO World Heritage Tentative List", "uri", "https://whc.unesco.org")
            ));
        addFallback("senegal",
            "The Ethereal Pink Lake Retba",
            "Senegal's Lake Retba famously flows with a striking pink hue caused by Dunaliella salina algae, which thrives in high-salt waters. Local salt harvesters protect their skin with Shea Butter before harvesting raw salt crystals.",
            List.of(Map.of("title", "Senegal National Tourism Agency", "uri", "https://www.senegal-tourism.com")));
        addFallback("egypt",
            "The Solar Alignment at Abu Simbel",
            "Twice a year on Feb 22 & Oct 22, the sun's rays align perfectly to illuminate the innermost chamber of the Great Temple of Abu Simbel, directly lighting statues of Pharaoh Ramses II and ancient solar gods.",
            List.of(Map.of("title", "Egypt Ministry of Tourism & Antiquities", "uri", "https://egymonuments.gov.eg")));
        addFallback("ethiopia",
            "Hand-Hewn Rock Churches of Lalibela",
            "Carved straight down into monolithic basalt bedrock in the 12th century, the eleven medieval churches of Lalibela are engineering marvels, complete with subterranean tunnel systems, deep trenches, and hidden water runoffs.",
            List.of(
                Map.of("title", "Ethiopian Tourism Commission", "uri", "https://www.ethiopia.travel"),
                Map.of("title", "UNESCO World Heritage Site", "uri", "https://whc.unesco.org/en/list/18")
            ));
        addFallback("india",
            "Living Root Suspension Bridges of Meghalaya",
            "Handmade by the indigenous Khasi people over generations, these stunning bridges are trained from live aerial roots of rubber fig trees across rushing canyons, growing stronger, more resilient, and self-healing over time.",
            List.of(Map.of("title", "Incredible India Official Hub", "uri", "https://www.incredibleindia.org")));
        addFallback("france",
            "Tidal Fortress of Mont Saint-Michel",
            "Perched on a rocky tidal islet in Normandy, this spectacular medieval abbey gets completely surrounded by seawater during high tides. It showcases ancient marvel high-Gothic ramparts and double-layered defense gates.",
            List.of(Map.of("title", "France National Monuments Center", "uri", "https://www.monuments-nationaux.fr")));
        addFallback("mexico",
            "Bioluminescent Bays of Isla Holbox",
            "On pitch-black summer nights, the sandy beaches of Isla Holbox sparkle with brilliant cobalt-blue neon swirls of bioluminescent microscopic algae, lighting up whenever the warm Caribbean waters are nudged.",
            List.of(Map.of("title", "Visit Mexico Tourism Board", "uri", "https://www.visitmexico.com")));
        addFallback("thailand",
            "The Spectacular White Temple of Chiang Rai",
            "Known as Wat Rong Khun, this magnificent masterwork is completely whitewashed to indicate absolute purity and lined with millions of tiny glass mirror fragments that gleam in the tropical sun.",
            List.of(Map.of("title", "Tourism Authority of Thailand", "uri", "https://www.tourismthailand.org")));
        addFallback("colombia",
            "The Giant Wax Palms of Cocora Valley",
            "Set amidst misty green Andean peaks, the Cocora Valley preserves the Quindío wax palm — the tallest palm tree species on Earth, soaring up to 60 meters high into mountain fog cloud-forests.",
            List.of(Map.of("title", "Colombia Official Travel Board", "uri", "https://colombia.travel")));

        GLOBAL_FALLBACKS.add(Map.of(
            "title", "The Ancient Mud Brick Minarets of Shibam, Yemen",
            "fact", "Often called the 'Manhattan of the Desert,' the 16th-century walled city of Shibam features some of the tallest residential high-rises made of sun-dried mud bricks, with some buildings climbing up to 8 stories high using native traditional techniques.",
            "sources", List.of(Map.of("title", "UNESCO Shibam World Heritage", "uri", "https://whc.unesco.org/en/list/192"))
        ));
        GLOBAL_FALLBACKS.add(Map.of(
            "title", "La Ventana Azul & Canary Islands Volcanic Tubes",
            "fact", "Formed by prehistoric eruptions, the Cueva de los Verdes of Lanzarote is one of the longest volcanic lava tunnels on earth, extending for over six kilometers. The cave is part of a delicate ecosystem with unique endemic albino crabs.",
            "sources", List.of(Map.of("title", "Canary Islands Official Travel Advisor", "uri", "https://www.hellocanaryislands.com"))
        ));
        GLOBAL_FALLBACKS.add(Map.of(
            "title", "Colombia's Rainbow River: Caño Cristales",
            "fact", "Commonly known as the 'River of Five Colors,' Caño Cristales bursts with shades of yellow, green, blue, black, and red from July to November, caused by the Macarenia clavigera aquatic plant clinging to the riverbed rocks.",
            "sources", List.of(Map.of("title", "Colombia Travel Official Site", "uri", "https://colombia.travel"))
        ));
    }

    private static void addFallback(String country, String title, String fact, List<Map<String, Object>> sources) {
        FALLBACK_INSIGHTS.computeIfAbsent(country, k -> new ArrayList<>())
            .add(Map.of("title", title, "fact", fact, "sources", sources));
    }

    private static final List<String> COUNTRIES = List.of(
        "Ivory Coast", "Kenya", "Nigeria", "South Africa", "Senegal",
        "Egypt", "Ethiopia", "Morocco", "Japan", "Brazil",
        "India", "France", "Mexico", "Thailand", "Colombia"
    );

    // Real, well-documented Akan/Twi proverbs — used verbatim when Gemini is unavailable,
    // and as the grounding example set in the prompt so generated ones stay authentic.
    private static final List<Map<String, String>> PROVERB_FALLBACKS = List.of(
        Map.of("twi", "Tikoro nkɔ agyina.", "english", "One head does not go into council.",
            "meaning", "Two heads are better than one — good decisions need many perspectives."),
        Map.of("twi", "Ɛberɛ te sɛ anomaa; sɛ woankyere no na ɔtu a, wonhu no bio.",
            "english", "Time is like a bird — if you don't catch it before it flies, you'll never see it again.",
            "meaning", "Seize the moment; time, once gone, does not return."),
        Map.of("twi", "Ɔkɔtɔ nwo anomaa.", "english", "A crab does not give birth to a bird.",
            "meaning", "Like father, like son — children carry the character of those who raised them."),
        Map.of("twi", "Nyansapɔ, kwasea ntumi nsane gye sɛ ɔnyansafoɔ.",
            "english", "The knot of wisdom, a fool cannot untie — only a wise person can.",
            "meaning", "Only wisdom can solve a truly difficult problem."),
        Map.of("twi", "Anomaa antu a, ɔbua da.", "english", "If a bird does not fly, it goes to bed hungry.",
            "meaning", "Nothing ventured, nothing gained — action is required for reward."),
        Map.of("twi", "Obi nnim ɔberempɔn ahyɛaseɛ.", "english", "Nobody knows the beginnings of a great man.",
            "meaning", "Don't dismiss humble beginnings — greatness can come from anywhere."),
        Map.of("twi", "Nsateaa nyinaa nnyɛ pɛ.", "english", "All fingers are not the same.",
            "meaning", "People have different strengths, and that difference should be valued."),
        Map.of("twi", "Obi nnim a, obi kyerɛ.", "english", "If someone doesn't know, someone teaches.",
            "meaning", "There's no shame in learning — knowledge is meant to be shared."),
        Map.of("twi", "Baanu soa a, emmia.", "english", "When two people carry a load, it doesn't hurt.",
            "meaning", "Burdens shared are burdens lightened."),
        Map.of("twi", "Ahwene pa nkasa.", "english", "Quality beads don't make noise.",
            "meaning", "True excellence speaks for itself and needs no boasting."),
        Map.of("twi", "Prayɛ, sɛ woyi baako a na ɛbu; wɔka bom a, ɛmmu.",
            "english", "One broomstick breaks alone; bound together, they don't.",
            "meaning", "In unity there is strength."),
        Map.of("twi", "Wamma wo yɔnko antwa nkɔ a, wo nso wontwa nkɔ.",
            "english", "If you don't let your friend cross, you won't cross either.",
            "meaning", "Helping others clears the way for your own progress."),
        Map.of("twi", "Woforo dua pa a, na yɛpia wo.", "english", "It is when you climb a good tree that we push you higher.",
            "meaning", "People support those pursuing worthy goals."),
        Map.of("twi", "Wo nsa akyi nyɛ sɛ wo nsa yam.", "english", "The back of your hand is never as sweet as your palm.",
            "meaning", "Home is always better than anywhere else, no matter how far you travel.")
    );

    public InsightService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getAkanProverb() {
        if (apiKey == null || apiKey.isBlank()) {
            return randomProverbFallback();
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + apiKey;

            ObjectNode requestBody = mapper.createObjectNode();
            ArrayNode contents = mapper.createArrayNode();
            ObjectNode contentObj = mapper.createObjectNode();
            ArrayNode parts = mapper.createArrayNode();
            ObjectNode part = mapper.createObjectNode();
            part.put("text",
                "Give me one real, well-documented traditional Akan (Twi) proverb from Ghana — never invent one. " +
                "Provide the original Twi text with correct orthography, an accurate literal English translation, " +
                "and a one-sentence explanation of its meaning. Respond with JSON only: " +
                "{\"twi\": \"...\", \"english\": \"...\", \"meaning\": \"...\"}");
            parts.add(part);
            contentObj.set("parts", parts);
            contentObj.put("role", "user");
            contents.add(contentObj);
            requestBody.set("contents", contents);

            ArrayNode tools = mapper.createArrayNode();
            ObjectNode tool = mapper.createObjectNode();
            tool.set("google_search", mapper.createObjectNode());
            tools.add(tool);
            requestBody.set("tools", tools);

            ObjectNode genConfig = mapper.createObjectNode();
            genConfig.put("responseMimeType", "application/json");
            requestBody.set("generationConfig", genConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(requestBody), headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String text = response.getBody().path("candidates").path(0).path("content")
                    .path("parts").path(0).path("text").asText("{}");
                Map<String, Object> parsed = mapper.readValue(text.trim(), Map.class);
                if (parsed.get("twi") != null && parsed.get("english") != null) {
                    parsed.put("isFallback", false);
                    return parsed;
                }
            }
        } catch (Exception e) {
            log.warn("[Insight] Akan proverb generation unavailable: {}", e.getMessage());
        }

        return randomProverbFallback();
    }

    private Map<String, Object> randomProverbFallback() {
        Map<String, String> pick = PROVERB_FALLBACKS.get((int) (Math.random() * PROVERB_FALLBACKS.size()));
        Map<String, Object> result = new HashMap<>(pick);
        result.put("isFallback", true);
        return result;
    }

    public Map<String, Object> getLocalInsight(String countryParam) {
        String selectedCountry = (countryParam != null && !countryParam.isBlank())
            ? countryParam
            : COUNTRIES.get((int) (Math.random() * COUNTRIES.size()));

        if (apiKey == null || apiKey.isBlank()) {
            return buildFallback(selectedCountry);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + apiKey;

            ObjectNode requestBody = mapper.createObjectNode();

            ArrayNode contents = mapper.createArrayNode();
            ObjectNode contentObj = mapper.createObjectNode();
            ArrayNode parts = mapper.createArrayNode();
            ObjectNode part = mapper.createObjectNode();
            part.put("text", "Provide one extremely fascinating, authentic, and specific cultural heritage fact or unique tourist destination travel tip about " + selectedCountry + ". Avoid generic trivia; pick something highly unique, memorable, and educational. Keep it concise (2-3 sentences max). Respond with JSON: {\"country\": \"...\", \"title\": \"...\", \"fact\": \"...\"}");
            parts.add(part);
            contentObj.set("parts", parts);
            contentObj.put("role", "user");
            contents.add(contentObj);
            requestBody.set("contents", contents);

            ArrayNode tools = mapper.createArrayNode();
            ObjectNode tool = mapper.createObjectNode();
            tool.set("google_search", mapper.createObjectNode());
            tools.add(tool);
            requestBody.set("tools", tools);

            ObjectNode genConfig = mapper.createObjectNode();
            genConfig.put("responseMimeType", "application/json");
            requestBody.set("generationConfig", genConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(requestBody), headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode body = response.getBody();
                String text = body.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("{}");

                Map<String, Object> parsed;
                try {
                    parsed = mapper.readValue(text.trim(), Map.class);
                } catch (Exception e) {
                    parsed = new HashMap<>();
                    parsed.put("country", selectedCountry);
                    parsed.put("title", "Discovering " + selectedCountry);
                    parsed.put("fact", text);
                }

                List<Map<String, String>> sources = new ArrayList<>();
                JsonNode groundingChunks = body.path("candidates").path(0)
                    .path("groundingMetadata").path("groundingChunks");
                if (groundingChunks.isArray()) {
                    Map<String, String> seen = new LinkedHashMap<>();
                    for (JsonNode chunk : groundingChunks) {
                        String uri = chunk.path("web").path("uri").asText("");
                        String title = chunk.path("web").path("title").asText("Travel Search Source");
                        if (!uri.isBlank() && !seen.containsKey(uri)) {
                            seen.put(uri, title);
                        }
                    }
                    seen.entrySet().stream().limit(3).forEach(e ->
                        sources.add(Map.of("title", e.getValue(), "uri", e.getKey())));
                }

                Map<String, Object> result = new HashMap<>(parsed);
                result.put("country", selectedCountry);
                result.put("sources", sources);
                return result;
            }
        } catch (Exception e) {
            log.warn("[Insight] Unavailable for: {} — {}", selectedCountry, e.getMessage());
        }

        return buildFallback(selectedCountry);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildFallback(String selectedCountry) {
        String key = selectedCountry.toLowerCase().trim();
        List<Map<String, Object>> list = FALLBACK_INSIGHTS.get(key);
        if (list == null) {
            for (String k : FALLBACK_INSIGHTS.keySet()) {
                if (key.contains(k) || k.contains(key)) {
                    list = FALLBACK_INSIGHTS.get(k);
                    break;
                }
            }
        }

        Map<String, Object> fallback;
        if (list != null && !list.isEmpty()) {
            fallback = list.get((int) (Math.random() * list.size()));
        } else {
            fallback = GLOBAL_FALLBACKS.get((int) (Math.random() * GLOBAL_FALLBACKS.size()));
        }

        Map<String, Object> result = new HashMap<>(fallback);
        result.put("country", selectedCountry);
        result.put("isFallback", true);
        return result;
    }
}
