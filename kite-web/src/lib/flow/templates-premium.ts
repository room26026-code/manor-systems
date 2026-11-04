import {
  BarChart3Icon,
  Gamepad2Icon,
  MegaphoneIcon,
  MessageSquareTextIcon,
  PartyPopperIcon,
  PinIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TicketIcon,
} from "lucide-react";
import { getEdgeId, getNodeId } from "./nodes";
import type { Template } from "./templates";

export function getPremiumTemplates(): Template[] {
  return [
    getStickyMessageTemplate(),
    getModmailTemplate(),
    getAutoModTemplate(),
    getBasicTicketsTemplate(),
    getRobloxLookupTemplate(),
    getChatWithAITemplate(),
    getWelcomeGoodbyeTemplate(),
    getAutoResponderTemplate(),
    getPollTemplate(),
    getAnnouncementTemplate(),
  ];
}

function getStickyMessageTemplate(): Template {
  const commandEntryNodeId = getNodeId();
  const commandPermissionsNodeId = getNodeId();
  const commandMessageNodeId = getNodeId();
  const commandResponseNodeId = getNodeId();

  const eventEntryNodeId = getNodeId();
  const eventConditionNodeId = getNodeId();
  const eventConditionItemNodeId = getNodeId();
  const eventConditionElseNodeId = getNodeId();
  const eventMessageNodeId = getNodeId();

  return {
    name: "Sticky Message",
    description:
      "Keeps an important message at the bottom of a channel and lets staff post it on demand.",
    tier: "premium",
    icon: PinIcon,
    inputs: [
      {
        key: "channel_id",
        label: "Channel ID",
        description: "The channel that should keep the sticky message.",
        type: "text",
        required: true,
      },
      {
        key: "sticky_message",
        label: "Sticky message",
        description: "The message that gets posted in the channel.",
        type: "textarea",
        required: true,
      },
    ],
    commands: [
      {
        name: "sticky",
        description: "Post the sticky message in the configured channel.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: commandEntryNodeId,
              type: "entry_command",
              data: {
                name: "sticky",
                description: "Post the sticky message in the configured channel.",
              },
            },
            {
              id: commandPermissionsNodeId,
              type: "option_command_permissions",
              data: {
                command_permissions: "8192",
              },
            },
            {
              id: commandMessageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.channel_id,
                message_data: {
                  content: inputs.sticky_message,
                },
              },
            },
            {
              id: commandResponseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: "Sticky message posted.",
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: commandPermissionsNodeId,
              target: commandEntryNodeId,
            },
            {
              id: getEdgeId(),
              source: commandEntryNodeId,
              target: commandMessageNodeId,
            },
            {
              id: getEdgeId(),
              source: commandMessageNodeId,
              target: commandResponseNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [
      {
        source: "discord",
        type: "message_create",
        description:
          "Repost the sticky message whenever someone talks in the channel.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: eventEntryNodeId,
              type: "entry_event",
              data: {
                event_type: "message_create",
                description:
                  "Repost the sticky message whenever someone talks in the channel.",
              },
            },
            {
              id: eventConditionNodeId,
              type: "control_condition_compare",
              data: {
                condition_base_value: "{{event.channel.id}}",
              },
            },
            {
              id: eventConditionItemNodeId,
              type: "control_condition_item_compare",
              data: {
                condition_item_value: inputs.channel_id,
                condition_item_mode: "equal",
              },
            },
            {
              id: eventConditionElseNodeId,
              type: "control_condition_item_else",
              data: {},
            },
            {
              id: eventMessageNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{event.channel.id}}",
                message_data: {
                  content: inputs.sticky_message,
                },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: eventEntryNodeId,
              target: eventConditionNodeId,
            },
            {
              id: getEdgeId(),
              source: eventConditionNodeId,
              target: eventConditionItemNodeId,
            },
            {
              id: getEdgeId(),
              source: eventConditionNodeId,
              target: eventConditionElseNodeId,
            },
            {
              id: getEdgeId(),
              source: eventConditionItemNodeId,
              target: eventMessageNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getModmailTemplate(): Template {
  const entryNodeId = getNodeId();
  const optionMessageNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const directMessageNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Modmail",
    description:
      "Lets members message the staff team from any channel, with a DM confirmation.",
    tier: "premium",
    icon: MessageSquareTextIcon,
    inputs: [
      {
        key: "modmail_channel_id",
        label: "Modmail channel ID",
        description: "The staff channel that receives modmail messages.",
        type: "text",
        required: true,
      },
    ],
    commands: [
      {
        name: "modmail",
        description: "Send a message to the staff team.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "modmail",
                description: "Send a message to the staff team.",
              },
            },
            {
              id: optionMessageNodeId,
              type: "option_command_argument",
              data: {
                name: "message",
                description: "The message you want to send to the staff team.",
                command_argument_type: "string",
                command_argument_required: true,
              },
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.modmail_channel_id,
                message_data: {
                  content:
                    "**New modmail**\n**From:** {{user.mention}} ({{user.username}})\n\n{{interaction.command.args.message}}",
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
                    "Your message has been delivered to the staff team. They will get back to you as soon as possible.",
                },
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: "Your modmail was sent to the staff team.",
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: optionMessageNodeId,
              target: entryNodeId,
            },
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

function getAutoModTemplate(): Template {
  const entryNodeId = getNodeId();
  const conditionNodeId = getNodeId();
  const conditionItemNodeId = getNodeId();
  const conditionElseNodeId = getNodeId();
  const deleteNodeId = getNodeId();
  const warningNodeId = getNodeId();

  return {
    name: "Auto Mod",
    description:
      "Deletes messages that contain a phrase you choose and warns the author.",
    tier: "premium",
    icon: ShieldAlertIcon,
    inputs: [
      {
        key: "blocked_phrase",
        label: "Blocked phrase",
        description:
          "Messages containing this phrase are removed, for example discord.gg.",
        type: "text",
        required: true,
      },
    ],
    commands: [],
    eventListeners: [
      {
        source: "discord",
        type: "message_create",
        description: "Remove messages that contain the blocked phrase.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_event",
              data: {
                event_type: "message_create",
                description: "Remove messages that contain the blocked phrase.",
              },
            },
            {
              id: conditionNodeId,
              type: "control_condition_compare",
              data: {
                condition_base_value: "{{event.message.content}}",
              },
            },
            {
              id: conditionItemNodeId,
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
              id: deleteNodeId,
              type: "action_message_delete",
              data: {
                channel_target: "{{event.channel.id}}",
                message_target: "{{event.message.id}}",
                audit_log_reason: "Auto Mod: blocked phrase",
              },
            },
            {
              id: warningNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{event.channel.id}}",
                message_data: {
                  content:
                    "{{event.user.mention}}, that message was removed because it contained a blocked phrase.",
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
              target: conditionItemNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionNodeId,
              target: conditionElseNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionItemNodeId,
              target: deleteNodeId,
            },
            {
              id: getEdgeId(),
              source: deleteNodeId,
              target: warningNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getBasicTicketsTemplate(): Template {
  const entryNodeId = getNodeId();
  const modalNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Basic Tickets",
    description:
      "A ticket command with a modal form that forwards the details to your staff channel.",
    tier: "premium",
    icon: TicketIcon,
    inputs: [
      {
        key: "tickets_channel_id",
        label: "Tickets channel ID",
        description: "The channel that receives new tickets.",
        type: "text",
        required: true,
      },
    ],
    commands: [
      {
        name: "ticket",
        description: "Open a support ticket.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "ticket",
                description: "Open a support ticket.",
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
                          custom_id: "details",
                          label: "Describe your issue",
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
                channel_target: inputs.tickets_channel_id,
                message_data: {
                  content:
                    "**New ticket**\n**From:** {{user.mention}}\n**Subject:** {{input('subject')}}\n**Details:** {{input('details')}}",
                },
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content:
                    "Your ticket has been submitted. The staff team will reply soon.",
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

function getRobloxLookupTemplate(): Template {
  const entryNodeId = getNodeId();
  const optionUsernameNodeId = getNodeId();
  const lookupNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Roblox Lookup",
    description:
      "Looks up a Roblox account by username and replies with its profile details.",
    tier: "premium",
    icon: Gamepad2Icon,
    inputs: [],
    commands: [
      {
        name: "roblox",
        description: "Look up a Roblox user by username.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "roblox",
                description: "Look up a Roblox user by username.",
              },
            },
            {
              id: optionUsernameNodeId,
              type: "option_command_argument",
              data: {
                name: "username",
                description: "The Roblox username to look up.",
                command_argument_type: "string",
                command_argument_required: true,
              },
            },
            {
              id: lookupNodeId,
              type: "action_roblox_user_get",
              data: {
                roblox_user_target: "{{interaction.command.args.username}}",
                roblox_lookup_mode: "username",
                temporary_name: "roblox_user",
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: `**{{nodes.${lookupNodeId}.result.display_name}}** (@{{nodes.${lookupNodeId}.result.name}})
**User ID:** {{nodes.${lookupNodeId}.result.id}}
**Created:** {{nodes.${lookupNodeId}.result.created_at}}
**Verified:** {{nodes.${lookupNodeId}.result.has_verified_badge}}`,
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: optionUsernameNodeId,
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

function getChatWithAITemplate(): Template {
  const commandEntryNodeId = getNodeId();
  const commandOptionNodeId = getNodeId();
  const commandAINodeId = getNodeId();
  const commandResponseNodeId = getNodeId();

  const eventEntryNodeId = getNodeId();
  const eventConditionNodeId = getNodeId();
  const eventConditionItemNodeId = getNodeId();
  const eventConditionElseNodeId = getNodeId();
  const eventAINodeId = getNodeId();
  const eventMessageNodeId = getNodeId();

  return {
    name: "Chat with AI",
    description:
      "Lets members chat with an AI in a channel of your choice, and adds an ask command.",
    tier: "premium",
    requiresAI: true,
    icon: SparklesIcon,
    inputs: [
      {
        key: "channel_id",
        label: "Channel ID",
        description: "The channel where the AI replies to every message.",
        type: "text",
        required: true,
      },
      {
        key: "personality",
        label: "Personality",
        description: "Tell the AI how it should respond to messages.",
        type: "textarea",
        required: false,
      },
    ],
    commands: [
      {
        name: "chat",
        description: "Ask the AI a question.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: commandEntryNodeId,
              type: "entry_command",
              data: {
                name: "chat",
                description: "Ask the AI a question.",
              },
            },
            {
              id: commandOptionNodeId,
              type: "option_command_argument",
              data: {
                name: "question",
                description: "The question to ask the AI.",
                command_argument_type: "string",
                command_argument_required: true,
              },
            },
            {
              id: commandAINodeId,
              type: "action_ai_chat_completion",
              data: {
                ai_chat_completion_data: {
                  system_prompt: inputs.personality ?? undefined,
                  prompt: "{{interaction.command.args.question}}",
                },
              },
            },
            {
              id: commandResponseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: `{{nodes.${commandAINodeId}.result}}`,
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: commandOptionNodeId,
              target: commandEntryNodeId,
            },
            {
              id: getEdgeId(),
              source: commandEntryNodeId,
              target: commandAINodeId,
            },
            {
              id: getEdgeId(),
              source: commandAINodeId,
              target: commandResponseNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [
      {
        source: "discord",
        type: "message_create",
        description: "Reply to every message in the AI channel.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: eventEntryNodeId,
              type: "entry_event",
              data: {
                event_type: "message_create",
                description: "Reply to every message in the AI channel.",
              },
            },
            {
              id: eventConditionNodeId,
              type: "control_condition_compare",
              data: {
                condition_base_value: "{{event.channel.id}}",
              },
            },
            {
              id: eventConditionItemNodeId,
              type: "control_condition_item_compare",
              data: {
                condition_item_value: inputs.channel_id,
                condition_item_mode: "equal",
              },
            },
            {
              id: eventConditionElseNodeId,
              type: "control_condition_item_else",
              data: {},
            },
            {
              id: eventAINodeId,
              type: "action_ai_chat_completion",
              data: {
                ai_chat_completion_data: {
                  system_prompt: inputs.personality ?? undefined,
                  prompt: "{{event.message.content}}",
                },
              },
            },
            {
              id: eventMessageNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{event.channel.id}}",
                message_data: {
                  content: `{{event.user.mention}} {{nodes.${eventAINodeId}.result}}`,
                },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: eventEntryNodeId,
              target: eventConditionNodeId,
            },
            {
              id: getEdgeId(),
              source: eventConditionNodeId,
              target: eventConditionItemNodeId,
            },
            {
              id: getEdgeId(),
              source: eventConditionNodeId,
              target: eventConditionElseNodeId,
            },
            {
              id: getEdgeId(),
              source: eventConditionItemNodeId,
              target: eventAINodeId,
            },
            {
              id: getEdgeId(),
              source: eventAINodeId,
              target: eventMessageNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getWelcomeGoodbyeTemplate(): Template {
  const joinEntryNodeId = getNodeId();
  const joinMessageNodeId = getNodeId();

  const leaveEntryNodeId = getNodeId();
  const leaveMessageNodeId = getNodeId();

  return {
    name: "Welcome & Goodbye",
    description:
      "Greets new members and says goodbye when someone leaves your server.",
    tier: "premium",
    icon: PartyPopperIcon,
    inputs: [
      {
        key: "welcome_channel_id",
        label: "Welcome channel ID",
        description: "The channel that receives welcome messages.",
        type: "text",
        required: true,
      },
      {
        key: "goodbye_channel_id",
        label: "Goodbye channel ID",
        description: "The channel that receives goodbye messages.",
        type: "text",
        required: true,
      },
    ],
    commands: [],
    eventListeners: [
      {
        source: "discord",
        type: "guild_member_add",
        description: "Welcome a new member to the server.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: joinEntryNodeId,
              type: "entry_event",
              data: {
                event_type: "guild_member_add",
                description: "Welcome a new member to the server.",
              },
            },
            {
              id: joinMessageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.welcome_channel_id,
                message_data: {
                  content:
                    "Welcome {{event.user.mention}} to **{{event.guild.name}}**!",
                },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: joinEntryNodeId,
              target: joinMessageNodeId,
            },
          ],
        }),
      },
      {
        source: "discord",
        type: "guild_member_remove",
        description: "Say goodbye when a member leaves the server.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: leaveEntryNodeId,
              type: "entry_event",
              data: {
                event_type: "guild_member_remove",
                description: "Say goodbye when a member leaves the server.",
              },
            },
            {
              id: leaveMessageNodeId,
              type: "action_message_create",
              data: {
                channel_target: inputs.goodbye_channel_id,
                message_data: {
                  content: "**{{event.user.username}}** has left the server.",
                },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: leaveEntryNodeId,
              target: leaveMessageNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getAutoResponderTemplate(): Template {
  const entryNodeId = getNodeId();
  const conditionNodeId = getNodeId();
  const conditionItemNodeId = getNodeId();
  const conditionElseNodeId = getNodeId();
  const messageNodeId = getNodeId();

  return {
    name: "Auto Responder",
    description:
      "Replies automatically whenever a message contains a keyword you choose.",
    tier: "premium",
    icon: MessageSquareTextIcon,
    inputs: [
      {
        key: "keyword",
        label: "Keyword",
        description: "Messages containing this keyword get an automatic reply.",
        type: "text",
        required: true,
      },
      {
        key: "response",
        label: "Reply",
        description: "The message the bot replies with.",
        type: "text",
        required: true,
      },
    ],
    commands: [],
    eventListeners: [
      {
        source: "discord",
        type: "message_create",
        description: "Reply to messages that contain the keyword.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_event",
              data: {
                event_type: "message_create",
                description: "Reply to messages that contain the keyword.",
              },
            },
            {
              id: conditionNodeId,
              type: "control_condition_compare",
              data: {
                condition_base_value: "{{event.message.content}}",
              },
            },
            {
              id: conditionItemNodeId,
              type: "control_condition_item_compare",
              data: {
                condition_item_value: inputs.keyword,
                condition_item_mode: "contains",
              },
            },
            {
              id: conditionElseNodeId,
              type: "control_condition_item_else",
              data: {},
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{event.channel.id}}",
                message_data: {
                  content: inputs.response,
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
              target: conditionItemNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionNodeId,
              target: conditionElseNodeId,
            },
            {
              id: getEdgeId(),
              source: conditionItemNodeId,
              target: messageNodeId,
            },
          ],
        }),
      },
    ],
  };
}

function getPollTemplate(): Template {
  const entryNodeId = getNodeId();
  const optionQuestionNodeId = getNodeId();
  const optionOneNodeId = getNodeId();
  const optionTwoNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const firstReactionNodeId = getNodeId();
  const secondReactionNodeId = getNodeId();

  return {
    name: "Polls",
    description:
      "Creates a poll with two options and adds reaction votes automatically.",
    tier: "premium",
    icon: BarChart3Icon,
    inputs: [],
    commands: [
      {
        name: "poll",
        description: "Create a poll with two options.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "poll",
                description: "Create a poll with two options.",
              },
            },
            {
              id: optionQuestionNodeId,
              type: "option_command_argument",
              data: {
                name: "question",
                description: "The question to ask.",
                command_argument_type: "string",
                command_argument_required: true,
              },
            },
            {
              id: optionOneNodeId,
              type: "option_command_argument",
              data: {
                name: "option_one",
                description: "The first answer.",
                command_argument_type: "string",
                command_argument_required: true,
              },
            },
            {
              id: optionTwoNodeId,
              type: "option_command_argument",
              data: {
                name: "option_two",
                description: "The second answer.",
                command_argument_type: "string",
                command_argument_required: true,
              },
            },
            {
              id: messageNodeId,
              type: "action_message_create",
              data: {
                channel_target: "{{channel.id}}",
                message_data: {
                  content:
                    "**{{interaction.command.args.question}}**\n\n👍 {{interaction.command.args.option_one}}\n👎 {{interaction.command.args.option_two}}",
                },
              },
            },
            {
              id: firstReactionNodeId,
              type: "action_message_reaction_create",
              data: {
                channel_target: "{{channel.id}}",
                message_target: `{{nodes.${messageNodeId}.result.id}}`,
                emoji_data: { name: "👍" },
              },
            },
            {
              id: secondReactionNodeId,
              type: "action_message_reaction_create",
              data: {
                channel_target: "{{channel.id}}",
                message_target: `{{nodes.${messageNodeId}.result.id}}`,
                emoji_data: { name: "👎" },
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: optionQuestionNodeId,
              target: entryNodeId,
            },
            {
              id: getEdgeId(),
              source: optionOneNodeId,
              target: entryNodeId,
            },
            {
              id: getEdgeId(),
              source: optionTwoNodeId,
              target: entryNodeId,
            },
            {
              id: getEdgeId(),
              source: entryNodeId,
              target: messageNodeId,
            },
            {
              id: getEdgeId(),
              source: messageNodeId,
              target: firstReactionNodeId,
            },
            {
              id: getEdgeId(),
              source: firstReactionNodeId,
              target: secondReactionNodeId,
            },
          ],
        }),
      },
    ],
    eventListeners: [],
  };
}

function getAnnouncementTemplate(): Template {
  const entryNodeId = getNodeId();
  const permissionsNodeId = getNodeId();
  const modalNodeId = getNodeId();
  const messageNodeId = getNodeId();
  const responseNodeId = getNodeId();

  return {
    name: "Announcements",
    description:
      "Lets staff post a formatted announcement through a modal form.",
    tier: "premium",
    icon: MegaphoneIcon,
    inputs: [
      {
        key: "announcements_channel_id",
        label: "Announcements channel ID",
        description: "The channel that receives the announcements.",
        type: "text",
        required: true,
      },
    ],
    commands: [
      {
        name: "announce",
        description: "Post an announcement in the announcements channel.",
        flowSource: (inputs) => ({
          nodes: [
            {
              id: entryNodeId,
              type: "entry_command",
              data: {
                name: "announce",
                description: "Post an announcement in the announcements channel.",
              },
            },
            {
              id: permissionsNodeId,
              type: "option_command_permissions",
              data: {
                command_permissions: "8192",
              },
            },
            {
              id: modalNodeId,
              type: "suspend_response_modal",
              data: {
                modal_data: {
                  title: "New announcement",
                  components: [
                    {
                      components: [
                        {
                          custom_id: "title",
                          label: "Title",
                          style: 1,
                          required: true,
                          max_length: 100,
                        },
                      ],
                    },
                    {
                      components: [
                        {
                          custom_id: "message",
                          label: "Announcement",
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
                channel_target: inputs.announcements_channel_id,
                message_data: {
                  content: "**{{input('title')}}**\n\n{{input('message')}}",
                },
              },
            },
            {
              id: responseNodeId,
              type: "action_response_create",
              data: {
                message_data: {
                  content: "Announcement posted.",
                },
                message_ephemeral: true,
              },
            },
          ],
          edges: [
            {
              id: getEdgeId(),
              source: permissionsNodeId,
              target: entryNodeId,
            },
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
