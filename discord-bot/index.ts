import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID ?? ''
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const APPLY_CHANNEL_ID = '1512028181056716840'
const TICKET_CHANNEL_ID = '1512700240761852114'

const DATA_FILE = path.join(__dirname, 'applications.json')

interface Application {
  discordId: string
  discordName: string
  ign: string
  tier: string
  appliedAt: string
  threadId: string | null
}

interface AppData {
  panelMessageId: string | null
  applications: Record<string, Application>
}

function loadData(): AppData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch {}
  return { panelMessageId: null, applications: {} }
}

function saveData(data: AppData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Post the apply panel in the apply channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('resetpanel')
    .setDescription('Clear all applications so players can apply again')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('applicants')
    .setDescription('View all applicants')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check a player\'s rank')
    .addStringOption(opt =>
      opt.setName('player')
        .setDescription('Player username')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top players')
    .addStringOption(opt =>
      opt.setName('mode')
        .setDescription('Game mode')
        .addChoices(
          { name: 'Sword', value: 'sword' },
          { name: 'Axe', value: 'axe' },
          { name: 'Pot', value: 'pot' },
          { name: 'NethPot', value: 'nethpot' },
          { name: 'UHC', value: 'uhc' },
          { name: 'Mace', value: 'mace' },
          { name: 'SMP', value: 'smp' },
          { name: 'Vanilla', value: 'vanilla' },
        )
    ),

  new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submit a match result')
    .addStringOption(opt =>
      opt.setName('player1')
        .setDescription('First player username')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('player2')
        .setDescription('Second player username')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('winner')
        .setDescription('Match winner')
        .setRequired(true)
        .addChoices(
          { name: 'Player 1', value: 'player1' },
          { name: 'Player 2', value: 'player2' },
          { name: 'Draw', value: 'draw' },
        )
    )
    .addStringOption(opt =>
      opt.setName('mode')
        .setDescription('Game mode')
        .addChoices(
          { name: 'Sword', value: 'sword' },
          { name: 'Axe', value: 'axe' },
          { name: 'Pot', value: 'pot' },
          { name: 'NethPot', value: 'nethpot' },
          { name: 'UHC', value: 'uhc' },
          { name: 'Mace', value: 'mace' },
          { name: 'SMP', value: 'smp' },
          { name: 'Vanilla', value: 'vanilla' },
        )
    ),

  new SlashCommandBuilder()
    .setName('player')
    .setDescription('Get player profile link')
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('Player username')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('tiers')
    .setDescription('View all tier rankings'),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View platform statistics'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),
]

async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)
    console.log('[Discord] Registering slash commands...')

    await rest.put(
      Routes.applicationGuildCommands(client.user!.id, DISCORD_GUILD_ID),
      { body: commands.map(c => c.toJSON()) }
    )

    console.log('[Discord] Commands registered successfully')
  } catch (error) {
    console.error('[Discord] Failed to register commands:', error)
  }
}

async function createApplyPanel() {
  try {
    const channel = await client.channels.fetch(APPLY_CHANNEL_ID)
    if (!channel || !channel.isTextBased()) {
      console.error('[Discord] Apply channel not found or not text-based')
      return
    }

    const data = loadData()

    if (data.panelMessageId) {
      try {
        const old = await channel.messages.fetch(data.panelMessageId)
        await old.delete()
      } catch {}
    }

    const embed = new EmbedBuilder()
      .setColor(0xfbbf24)
      .setTitle('TierCore Tournament Apply')
      .setDescription(
        'Click the button below to apply for the upcoming tournament.\n\n' +
        'You can only apply **once** until the panel is reset by staff.'
      )
      .setFooter({ text: 'TierCore Rankings' })

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('apply_tournament')
          .setLabel('Apply Now')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎮'),
      )

    const msg = await (channel as any).send({ embeds: [embed], components: [row] })
    data.panelMessageId = msg.id
    saveData(data)
    console.log('[Discord] Apply panel posted in', APPLY_CHANNEL_ID)
  } catch (error) {
    console.error('[Discord] Failed to create apply panel:', error)
  }
}

async function getTierForIgn(ign: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/players?search=${encodeURIComponent(ign)}`)
    const data: any = await res.json()
    if (data.data?.length) {
      return data.data[0].tier ?? 'Unranked'
    }
  } catch {}
  return 'Unranked'
}

async function addAdminsToThread(thread: any, guild: any) {
  try {
    await guild.members.fetch()
    const adminMembers = guild.members.cache.filter((m: any) =>
      m.permissions.has(PermissionFlagsBits.Administrator) && !m.user.bot
    )
    for (const [, member] of adminMembers) {
      try {
        await thread.members.add(member.id)
      } catch {}
    }
  } catch {}
}

client.once('ready', async () => {
  console.log(`[Discord] Bot logged in as ${client.user?.tag}`)
  await registerCommands()
})

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName, options } = interaction

    try {
      switch (commandName) {
        case 'panel': {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: '❌ Admin only.', ephemeral: true })
            return
          }
          await interaction.deferReply({ ephemeral: true })
          await createApplyPanel()
          await interaction.editReply({ content: '✅ Apply panel posted!' })
          break
        }

        case 'resetpanel': {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: '❌ Admin only.', ephemeral: true })
            return
          }
          const data = loadData()
          data.applications = {}
          saveData(data)
          await interaction.reply({ content: '✅ All applications cleared. Players can apply again.', ephemeral: true })
          break
        }

        case 'applicants': {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: '❌ Admin only.', ephemeral: true })
            return
          }
          const data = loadData()
          const apps = Object.values(data.applications)
          if (!apps.length) {
            await interaction.reply({ content: 'No applicants yet.', ephemeral: true })
            return
          }

          const lines = apps.map((a, i) =>
            `**${i + 1}.** ${a.ign} — ${a.tier} — ${a.discordName}`
          )

          const embed = new EmbedBuilder()
            .setColor(0xfbbf24)
            .setTitle(`Applicants (${apps.length})`)
            .setDescription(lines.slice(0, 25).join('\n'))
            .setFooter({ text: 'TierCore Rankings' })

          await interaction.reply({ embeds: [embed], ephemeral: true })
          break
        }

        case 'rank': {
          const playerName = options.getString('player', true)
          await interaction.deferReply()

          const res = await fetch(`${API_BASE_URL}/api/players?search=${playerName}`)
          const data: any = await res.json()

          if (!data.data?.length) {
            const embed = new EmbedBuilder()
              .setColor(0xff4444)
              .setTitle('Player Not Found')
              .setDescription(`Could not find player "${playerName}"`)
              .setFooter({ text: 'TierCore Rankings' })
            await interaction.editReply({ embeds: [embed] })
            return
          }

          const p = data.data[0]
          const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(`${p.username}`)
            .addFields(
              { name: 'Points', value: `${p.points}`, inline: true },
              { name: 'Tier', value: p.tier ?? 'Unranked', inline: true },
              { name: 'Rank', value: `#${p.rank}`, inline: true },
              { name: 'W/L', value: `${p.wins} / ${p.losses}`, inline: true },
              { name: 'Win Rate', value: `${p.winRate}%`, inline: true },
            )
            .setFooter({ text: 'TierCore Rankings' })

          await interaction.editReply({ embeds: [embed] })
          break
        }

        case 'leaderboard': {
          const mode = options.getString('mode') ?? 'sword'
          await interaction.deferReply()

          const res = await fetch(`${API_BASE_URL}/api/leaderboard?mode=${mode}&limit=10`)
          const data: any = await res.json()

          const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(`Leaderboard - ${mode.charAt(0).toUpperCase() + mode.slice(1)}`)
            .setDescription(
              (data.data ?? []).slice(0, 10).map(
                (p: any, i: number) => `**#${i + 1}** ${p.username} — ${p.points} PTS (${p.tier})`
              ).join('\n') || 'No data available'
            )
            .setFooter({ text: 'TierCore Rankings' })

          await interaction.editReply({ embeds: [embed] })
          break
        }

        case 'submit': {
          const player1 = options.getString('player1', true)
          const player2 = options.getString('player2', true)
          const winner = options.getString('winner', true)
          const mode = options.getString('mode') ?? 'sword'

          const embed = new EmbedBuilder()
            .setColor(0xfbbf24)
            .setTitle('Match Submission')
            .setDescription('Match submitted for approval')
            .addFields(
              { name: 'Player 1', value: player1, inline: true },
              { name: 'Player 2', value: player2, inline: true },
              { name: 'Winner', value: winner === 'draw' ? 'Draw' : winner === 'player1' ? player1 : player2, inline: true },
              { name: 'Mode', value: mode, inline: true },
            )
            .setFooter({ text: 'Pending approval' })

          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('approve_match')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('reject_match')
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger),
            )

          await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
          break
        }

        case 'player': {
          const username = options.getString('username', true)
          const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(username)
            .setDescription(`View full profile: ${API_BASE_URL}/player/${username.toLowerCase()}`)
            .setFooter({ text: 'TierCore Rankings' })
          await interaction.reply({ embeds: [embed] })
          break
        }

        case 'tiers': {
          const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('Tier Rankings (Points)')
            .setDescription(
              '**Low Tiers**\n' +
              'LT5: 0–39 PTS\n' +
              'LT4: 40–99 PTS\n' +
              'LT3: 100–199 PTS\n' +
              'LT2: 200–349 PTS\n' +
              'LT1: 350–549 PTS\n\n' +
              '**High Tiers**\n' +
              'HT5: 550–799 PTS\n' +
              'HT4: 800–1,099 PTS\n' +
              'HT3: 1,100–1,499 PTS\n' +
              'HT2: 1,500–1,999 PTS\n' +
              'HT1: 2,000+ PTS'
            )
            .setFooter({ text: 'TierCore Rankings' })
          await interaction.reply({ embeds: [embed] })
          break
        }

        case 'stats': {
          const embed = new EmbedBuilder()
            .setColor(0x4ade80)
            .setTitle('Platform Statistics')
            .addFields(
              { name: 'Active Players', value: '2,847', inline: true },
              { name: 'Matches Played', value: '124,592', inline: true },
              { name: 'Current Season', value: 'S3', inline: true },
            )
            .setFooter({ text: 'TierCore Rankings' })
          await interaction.reply({ embeds: [embed] })
          break
        }

        case 'help': {
          const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('TierCore Bot Commands')
            .setDescription(
              '`/panel` — Post the apply panel (Admin)\n' +
              '`/resetpanel` — Clear all applications (Admin)\n' +
              '`/applicants` — View all applicants (Admin)\n' +
              '`/rank <player>` — Check a player\'s rank\n' +
              '`/leaderboard [mode]` — View top players\n' +
              '`/submit <p1> <p2> <winner> [mode]` — Submit a match\n' +
              '`/player <username>` — Get player profile link\n' +
              '`/tiers` — View all tier rankings\n' +
              '`/stats` — Platform statistics\n' +
              '`/help` — This message'
            )
            .setFooter({ text: 'TierCore Rankings' })
          await interaction.reply({ embeds: [embed] })
          break
        }
      }
    } catch (error) {
      console.error(`[Discord] Error handling ${commandName}:`, error)
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true })
    }
    return
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'apply_tournament') {
      const data = loadData()

      if (data.applications[interaction.user.id]) {
        await interaction.reply({
          content: '❌ You have already applied! Wait for an admin to reset the panel if you want to apply again.',
          ephemeral: true,
        })
        return
      }

      const modal = new ModalBuilder()
        .setCustomId('apply_modal')
        .setTitle('Tournament Application')

      const ignInput = new TextInputBuilder()
        .setCustomId('ign')
        .setLabel('Your Minecraft In-Game Name')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g. Notch')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(16)

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(ignInput)

      modal.addComponents(row)
      await interaction.showModal(modal)
      return
    }

    if (interaction.customId === 'approve_match' || interaction.customId === 'reject_match') {
      await interaction.update({
        content: interaction.customId === 'approve_match'
          ? '✅ Match approved! Rankings will update shortly.'
          : '❌ Match rejected.',
        components: [],
      })
      return
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'apply_modal') {
    const ign = interaction.fields.getTextInputValue('ign')
    const data = loadData()

    if (data.applications[interaction.user.id]) {
      await interaction.reply({ content: '❌ You have already applied!', ephemeral: true })
      return
    }

    await interaction.deferReply({ ephemeral: true })

    const tier = await getTierForIgn(ign)

    let threadId: string | null = null

    try {
      const ticketChannel = await client.channels.fetch(TICKET_CHANNEL_ID)
      if (ticketChannel?.type === ChannelType.GuildText) {
        const thread = await ticketChannel.threads.create({
          name: `apply-${ign}`,
          type: ChannelType.PrivateThread,
          reason: `Tournament application from ${interaction.user.tag}`,
        })

        await thread.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xfbbf24)
              .setTitle('New Application')
              .addFields(
                { name: 'IGN', value: ign, inline: true },
                { name: 'Tier', value: tier, inline: true },
                { name: 'Discord', value: interaction.user.tag, inline: true },
                { name: 'Applied At', value: new Date().toLocaleString(), inline: false },
              )
              .setFooter({ text: 'TierCore Rankings' }),
          ],
        })

        threadId = thread.id

        const guild = await client.guilds.fetch(DISCORD_GUILD_ID)
        await addAdminsToThread(thread, guild)
      }
    } catch (error) {
      console.error('[Discord] Failed to create ticket thread:', error)
    }

    const application: Application = {
      discordId: interaction.user.id,
      discordName: interaction.user.tag,
      ign,
      tier,
      appliedAt: new Date().toISOString(),
      threadId,
    }

    data.applications[interaction.user.id] = application
    saveData(data)

    await interaction.editReply({
      content: `✅ Application submitted! You applied as **${ign}** (${tier}).`,
    })
  }
})

client.login(DISCORD_BOT_TOKEN).catch(err => {
  console.error('[Discord] Failed to login:', err.message)
  console.log('[Discord] Bot will not be available. Set DISCORD_BOT_TOKEN in .env')
})

export { client }
