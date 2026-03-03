import { createStartClient } from "@tanstack/start/client";
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";

const router = createRouter();

const client = createStartClient(router);

hydrateRoot(document, client);
