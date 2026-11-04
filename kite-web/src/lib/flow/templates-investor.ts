import {
  ClipboardListIcon,
  LightbulbIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  TicketIcon,
  UserRoundSearchIcon,
} from "lucide-react";
import { getEdgeId, getNodeId } from "./nodes";
import type { Template } from "./templates";

export function getInvestorTemplates(): Template[] {
  return [
    getAdvancedTicketsTemplate(),
    getStaffApplicationsTemplate(),
    getSuggestionsTemplate(),
    getAdvancedAutoModTemplate(),
    getWelcomeDMTemplate(),
    getUserLookupTemplate(),
  ];
}

function getAdvancedTicketsTemplate(): Template {
  const entryNodeId = getNodeId();
  const modalNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const directMessageNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Advanced Tickets",
    description:
      "A full ticket form with category and priority, a staff alert and a DM confirmation.",
    tier: "investor",
    icon: TicketIcon,
    inputs: [
      {
        key: "tickets_channel_id",
        label: "Tickets channel ID",
        description: "The staff channel that receives new tickets.",
        type: "text",
        required: true,
      },
    ],
    commands: [
      {
        name: "ticket",
        description: "Open a support ticket with priority.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "ticket",
                description: "Open a support ticket with priority.",
              },
            },
            {
              id: modalNodeId,
              type: "suspend_response_modal",
              data: {
                modal_data: {
                  title: "Open a ticket",
                  components: [
                    {
                      components: [
                        {
                          custom_id: "subject",
                          label: "Subject",
                          style: 1,
                          required: true,
                          max_length: 100,
                        },
                      ],
                    },
                    {
                      components: [
                        {
                          custom_id: "category",
                          label: "Category",
                          style: 1,
                          required: true,
                          max_length: 50,
                          placeholder: "Billing, bug report, appeal...",
                        },
                      ],
                    },
                    {
                      components: [
                        {
                          custom_id: "priority",
                          label: "Priority",
                          style: 1,
                          required: true,
                          max_length: 20,
                          placeholder: "Low, normal, urgent",
                        },
                      ],
                    },
                    {
                      components: [
                        {
                          custom_id: "details",
                          label: "Describe your issue",
                          style: 2,
                          required: true,
                          max_length: 1500,
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.tickets_channel_id,
                message_data: {
                  content:
                    "**New ticket**\n**From:** {{user.mention}} ({{user.username}})\n**Subject:** {{input('subject')}}\n**Category:** {{input('category')}}\n**Priority:** {{input('priority')}}\n\n{{input('details')}}",
                },
              },
            },
            {
              id: directMessageNodeId,
              type: "action_private_message_create",
              data: {
                user_target: "{{user.id}}",
                message_data: {
                  content:
                    "Your ticket **{{input('subject')}}** has been received. Priority: {{input('priority')}}. The staff team will reply soon.",
                },
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: "Your ticket is open. The staff team has been notified.",
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: modalNodeId,
            },
            {
              id: getEdgeId(),
              source: modalNodeId,
              target: messageNodeId,
            },
            {
              id: getEdgeId(),
              source: messageNodeId,
              target: directMessageNodeId,
            },
            {
              id: getEdgeId(),
              source: directMessageNodeId,
              target: responseNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [],
  };
}

function getStaffApplicationsTemplate(): Template {
  const entryNodeId = getNodeId();
  const modalNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Staff Applications",
    description:
      "Collects staff applications with a modal form and posts them for your team to review.",
    tier: "investor",
    icon: ClipboardListIcon,
    inputs: [
      {
        key: "applications_channel_id",
        label: "Applications channel ID",
        description: "The channel that receives staff applications.",
        type: "text",
        required: true,
      },
    ],
    commands: [
      {
        name: "apply",
        description: "Apply for a staff position.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "apply",
                description: "Apply for a staff position.",
              },
            },
            {
              id: modalNodeId,
              type: "suspend_response_modal",
              data: {
                modal_data: {
                  title: "Staff application",
                  components: [
                    {
                      components: [
                        {
                          custom_id: "position",
                          label: "Position",
                          style: 1,
                          required: true,
                          max_length: 50,
                          placeholder: "Moderator, support, developer...",
                        },
                      ],
                    },
                    {
                      components: [
                        {
                          custom_id: "experience",
                          label: "Experience",
                          style: 2,
                          required: true,
                          max_length: 1000,
                        },
                      ],
                    },
                    {
                      components: [
                        {
                          custom_id: "availability",
                          label: "Availability",
                          style: 1,
                          required: true,
                          max_length: 100,
                          placeholder: "Hours per week and timezone",
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.applications_channel_id,
                message_data: {
                  content:
                    "**New staff application**\n**Applicant:** {{user.mention}} ({{user.username}})\n**Position:** {{input('position')}}\n**Availability:** {{input('availability')}}\n\n**Experience:**\n{{input('experience')}}",
                },
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content:
                    "Thanks for applying! Your application has been sent to the team.",
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: modalNodeId,
            },
            {
              id: getEdgeId(),
              source: modalNodeId,
              target: messageNodeId,
            },
            {
              id: getEdgeId(),
              source: messageNodeId,
              target: responseNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [],
  };
}

function getSuggestionsTemplate(): Template {
  const entryNodeId = getNodeId();
  const modalNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const upvoteNodeId = getNodeId();
  const downvoteNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Suggestions",
    description:
      "Accepts suggestions through a form, then adds upvote and downvote reactions.",
    tier: "investor",
    icon: LightbulbIcon,
    inputs: [
      {
        key: "suggestions_channel_id",
        label: "Suggestions channel ID",
        description: "The channel that receives suggestions.",
        type: "text",
        required: true,
      },
    ],
    commands: [
      {
        name: "suggest",
        description: "Submit a suggestion for the server.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "suggest",
                description: "Submit a suggestion for the server.",
              },
            },
            {
              id: modalNodeId,
              type: "suspend_response_modal",
              data: {
                modal_data: {
                  title: "Submit a suggestion",
                  components: [
                    {
                      components: [
                        {
                          custom_id: "suggestion",
                          label: "Your suggestion",
                          style: 2,
                          required: true,
                          max_length: 1000,
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.suggestions_channel_id,
                message_data: {
                  content:
                    "**New suggestion** from {{user.mention}}\n\n{{input('suggestion')}}",
                },
              },
            },
            {
              id: upvoteNodeId,
              type: "action_message_reaction_create",
              data: {
                channel_target: inputs.suggestions_channel_id,
                message_target: `{{nodes.${messageNodeId}.result.id}}`,
                emoji_data: { name: "👍" },
              },
            },
            {
              id: downvoteNodeId,
              type: "action_message_reaction_create",
              data: {
                channel_target: inputs.suggestions_channel_id,
                message_target: `{{nodes.${messageNodeId}.result.id}}`,
                emoji_data: { name: "👎" },
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: "Thanks for your suggestion!",
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: modalNodeId,
            },
            {
              id: getEdgeId(),
              source: modalNodeId,
              target: messageNodeId,
            },
            {
              id: getEdgeId(),
              source: messageNodeId,
              target: upvoteNodeId,
            },
            {
              id: getEdgeId(),
              source: upvoteNodeId,
              target: downvoteNodeId,
            },
            {
              id: getEdgeId(),
              source: downvoteNodeId,
              target: responseNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [],
  };
}

function getAdvancedAutoModTemplate(): Template {
  const entryNodeId = getNodeId();
  const conditionNodeId = getNodeId();
  const inviteConditionItemNodeId = getNodeId();
  const phraseConditionItemNodeId = getNodeId();
  const conditionElseNodeId = getNodeId();
  const inviteDeleteNodeId = getNodeId();
  const inviteWarningNodeId = getNodeId();
  const phraseDeleteNodeId = getNodeId();
  const phraseWarningNodeId = getNodeId();

  return {
    name: "Advanced Auto Mod",
    description:
      "Removes invite links and blocked phrases, with a warning for the author.",
    tier: "investor",
    icon: ShieldCheckIcon,
    inputs: [
      {
        key: "blocked_phrase",
        label: "Blocked phrase",
        description: "An extra phrase to block, for example a slur or scam word.",
        type: "text",
        required: true,
      },
    ],
    commands: [],
    eventListeners: [
      {
        source: "discord",
        type: "message_create",
        description:
          "Remove invite links and messages that contain the blocked phrase.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_event",
              data: {
                event_type: "message_create",
                description:
                  "Remove invite links and messages that contain the blocked phrase.",
              },
            },
            {
              id: conditionNodeId,
              type: "control_condition_compare",
              data: {
                condition_base_value: "{{event.message.content}}",
                condition_allow_multiple: true,
              },
            },
            {
              id: inviteConditionItemNodeId,
              type: "control_condition_item_compare",
              data: {
                condition_item_value: "discord.gg",
                condition_item_mode: "contains",
              },
            },
            {
              id: phraseConditionItemNodeId,
              type: "control_condition_item_compare",
              data: {
                condition_item_value: inputs.blocked_phrase,
                condition_item_mode: "contains",
              },
            },
            {
              id: conditionElseNodeId,
              type: "control_condition_item_else",
              data: {},
            },
            {
              id: inviteDeleteNodeId,
              type: "action_message_delete",
              data: {
                channel_target: "{{event.channel.id}}",
                message_target: "{{event.message.id}}",
                audit_log_reason: "Auto Mod: invite link",
              },
            },
            {
              id: inviteWarningNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{event.channel.id}}",
                message_data: {
                  content:
                    "{{event.user.mention}}, invite links are not allowed here.",
                },
              },
            },
            {
              id: phraseDeleteNodeId,
              type: "action_message_delete",
              data: {
                channel_target: "{{event.channel.id}}",
                message_target: "{{event.message.id}}",
                audit_log_reason: "Auto Mod: blocked phrase",
              },
            },
            {
              id: phraseWarningNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{event.channel.id}}",
                message_data: {
                  content:
                    "{{event.user.mention}}, that message contained a blocked phrase.",
                },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: conditionNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionNodeId,
              target: inviteConditionItemNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionNodeId,
              target: phraseConditionItemNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionNodeId,
              target: conditionElseNodeId,
            },
            {
              id: getEdgeId(),
              source: inviteConditionItemNodeId,
              target: inviteDeleteNodeId,
            },
            {
              id: getEdgeId(),
              source: inviteDeleteNodeId,
              target: inviteWarningNodeId,
            },
            {
              id: getEdgeId(),
              source: phraseConditionItemNodeId,
              target: phraseDeleteNodeId,
            },
            {
              id: getEdgeId(),
              source: phraseDeleteNodeId,
              target: phraseWarningNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getWelcomeDMTemplate(): Template {
  const entryNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const directMessageNodeId = getNodeId();

  return {
    name: "Welcome DM",
    description:
      "Welcomes new members in a channel and sends them a private welcome message.",
    tier: "investor",
    icon: MessagesSquareIcon,
    inputs: [
      {
        key: "welcome_channel_id",
        label: "Welcome channel ID",
        description: "The channel that receives the public welcome message.",
        type: "text",
        required: true,
      },
    ],
    commands: [],
    eventListeners: [
      {
        source: "discord",
        type: "guild_member_add",
        description: "Welcome a new member in the channel and by DM.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_event",
              data: {
                event_type: "guild_member_add",
                description: "Welcome a new member in the channel and by DM.",
              },
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.welcome_channel_id,
                message_data: {
                  content:
                    "Welcome {{event.user.mention}} to **{{event.guild.name}}**!",
                },
              },
            },
            {
              id: directMessageNodeId,
              type: "action_private_message_create",
              data: {
                user_target: "{{event.user.id}}",
                message_data: {
                  content:
                    "Hey {{event.user.username}}, welcome to **{{event.guild.name}}**! Take a look at the rules channel and say hi.",
                },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: messageNodeId,
            },
            {
              id: getEdgeId(),
              source: messageNodeId,
              target: directMessageNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getUserLookupTemplate(): Template {
  const entryNodeId = getNodeId();
  const optionUserNodeId = getNodeId();
  const lookupNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Member Lookup",
    description:
      "Shows a member's username, display name, ID and avatar in a private reply.",
    tier: "investor",
    icon: UserRoundSearchIcon,
    inputs: [],
    commands: [
      {
        name: "userinfo",
        description: "Show information about a member.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "userinfo",
                description: "Show information about a member.",
              },
            },
            {
              id: optionUserNodeId,
              type: "option_command_argument",
              data: {
                name: "user",
                description: "The member to look up.",
                command_argument_type: "user",
                command_argument_required: true,
              },
            },
            {
              id: lookupNodeId,
              type: "action_user_get",
              data: {
                user_target: "{{interaction.command.args.user}}",
                temporary_name: "user_info",
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: `**{{nodes.${lookupNodeId}.result.display_name}}**
**Username:** {{nodes.${lookupNodeId}.result.username}}
**ID:** {{nodes.${lookupNodeId}.result.id}}
**Avatar:** {{nodes.${lookupNodeId}.result.avatar_url}}`,
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: optionUserNodeId,
              target: entryNodeId,
            },
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: lookupNodeId,
            },
            {
              id: getEdgeId(),
              source: lookupNodeId,
              target: responseNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [],
  };
}
