#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import twilio from "twilio";

// Environment variables for Twilio credentials
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error("Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required");
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Create server instance
const server = new Server(
  {
    name: "twilio-monitor-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_alerts",
        description: "List Twilio Monitor alerts. Alerts are generated when Twilio detects issues with your account.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of alerts to return (default: 20, max: 1000)",
              default: 20,
            },
            logLevel: {
              type: "string",
              description: "Filter by log level: error, warning, notice, or debug",
              enum: ["error", "warning", "notice", "debug"],
            },
            startDate: {
              type: "string",
              description: "Filter alerts created on or after this date (ISO 8601 format: YYYY-MM-DD)",
            },
            endDate: {
              type: "string",
              description: "Filter alerts created on or before this date (ISO 8601 format: YYYY-MM-DD)",
            },
          },
        },
      },
      {
        name: "get_alert",
        description: "Get details of a specific Twilio Monitor alert by its SID",
        inputSchema: {
          type: "object",
          properties: {
            alertSid: {
              type: "string",
              description: "The SID of the alert to retrieve",
            },
          },
          required: ["alertSid"],
        },
      },
      {
        name: "list_events",
        description: "List Twilio Monitor events. Events represent important occurrences in your Twilio account.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of events to return (default: 20, max: 1000)",
              default: 20,
            },
            actorSid: {
              type: "string",
              description: "Filter by the SID of the actor that caused the event",
            },
            eventType: {
              type: "string",
              description: "Filter by event type (e.g., 'account.updated', 'call.created')",
            },
            resourceSid: {
              type: "string",
              description: "Filter by the SID of the resource that was affected",
            },
            sourceIpAddress: {
              type: "string",
              description: "Filter by source IP address",
            },
            startDate: {
              type: "string",
              description: "Filter events created on or after this date (ISO 8601 format: YYYY-MM-DD)",
            },
            endDate: {
              type: "string",
              description: "Filter events created on or before this date (ISO 8601 format: YYYY-MM-DD)",
            },
          },
        },
      },
      {
        name: "get_event",
        description: "Get details of a specific Twilio Monitor event by its SID",
        inputSchema: {
          type: "object",
          properties: {
            eventSid: {
              type: "string",
              description: "The SID of the event to retrieve",
            },
          },
          required: ["eventSid"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_alerts": {
        const { limit = 20, logLevel, startDate, endDate } = args as {
          limit?: number;
          logLevel?: string;
          startDate?: string;
          endDate?: string;
        };

        const options: any = { limit };
        if (logLevel) options.logLevel = logLevel;
        if (startDate) options.startDate = new Date(startDate);
        if (endDate) options.endDate = new Date(endDate);

        const alerts = await client.monitor.v1.alerts.list(options);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                alerts.map((alert) => ({
                  sid: alert.sid,
                  accountSid: alert.accountSid,
                  alertText: alert.alertText,
                  apiVersion: alert.apiVersion,
                  dateCreated: alert.dateCreated,
                  dateGenerated: alert.dateGenerated,
                  dateUpdated: alert.dateUpdated,
                  errorCode: alert.errorCode,
                  logLevel: alert.logLevel,
                  moreInfo: alert.moreInfo,
                  requestMethod: alert.requestMethod,
                  requestUrl: alert.requestUrl,
                  requestVariables: alert.requestVariables,
                  resourceSid: alert.resourceSid,
                  responseBody: alert.responseBody,
                  responseHeaders: alert.responseHeaders,
                  serviceSid: alert.serviceSid,
                })),
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_alert": {
        const { alertSid } = args as { alertSid: string };

        if (!alertSid) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "alertSid is required"
          );
        }

        const alert = await client.monitor.v1.alerts(alertSid).fetch();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  sid: alert.sid,
                  accountSid: alert.accountSid,
                  alertText: alert.alertText,
                  apiVersion: alert.apiVersion,
                  dateCreated: alert.dateCreated,
                  dateGenerated: alert.dateGenerated,
                  dateUpdated: alert.dateUpdated,
                  errorCode: alert.errorCode,
                  logLevel: alert.logLevel,
                  moreInfo: alert.moreInfo,
                  requestMethod: alert.requestMethod,
                  requestUrl: alert.requestUrl,
                  requestVariables: alert.requestVariables,
                  resourceSid: alert.resourceSid,
                  responseBody: alert.responseBody,
                  responseHeaders: alert.responseHeaders,
                  serviceSid: alert.serviceSid,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_events": {
        const {
          limit = 20,
          actorSid,
          eventType,
          resourceSid,
          sourceIpAddress,
          startDate,
          endDate,
        } = args as {
          limit?: number;
          actorSid?: string;
          eventType?: string;
          resourceSid?: string;
          sourceIpAddress?: string;
          startDate?: string;
          endDate?: string;
        };

        const options: any = { limit };
        if (actorSid) options.actorSid = actorSid;
        if (eventType) options.eventType = eventType;
        if (resourceSid) options.resourceSid = resourceSid;
        if (sourceIpAddress) options.sourceIpAddress = sourceIpAddress;
        if (startDate) options.startDate = new Date(startDate);
        if (endDate) options.endDate = new Date(endDate);

        const events = await client.monitor.v1.events.list(options);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                events.map((event) => ({
                  sid: event.sid,
                  accountSid: event.accountSid,
                  actorSid: event.actorSid,
                  actorType: event.actorType,
                  description: event.description,
                  eventDate: event.eventDate,
                  eventType: event.eventType,
                  resourceSid: event.resourceSid,
                  resourceType: event.resourceType,
                  sourceIpAddress: event.sourceIpAddress,
                  links: event.links,
                })),
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_event": {
        const { eventSid } = args as { eventSid: string };

        if (!eventSid) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "eventSid is required"
          );
        }

        const event = await client.monitor.v1.events(eventSid).fetch();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  sid: event.sid,
                  accountSid: event.accountSid,
                  actorSid: event.actorSid,
                  actorType: event.actorType,
                  description: event.description,
                  eventDate: event.eventDate,
                  eventType: event.eventType,
                  resourceSid: event.resourceSid,
                  resourceType: event.resourceType,
                  sourceIpAddress: event.sourceIpAddress,
                  links: event.links,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Twilio API error: ${error.message}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Twilio Monitor MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
