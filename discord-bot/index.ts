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
} from 'discord.js'

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID ?? ''
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const commands = [
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

client.once('ready', () => {
  console.log(`[Discord] Bot logged in as ${client.user?.tag}`)
  registerCommands()
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  const { commandName, options } = interaction

  try {
    switch (commandName) {
      case 'rank': {
        const playerName = options.getString('player', true)
        await interaction.deferReply()

        const res = await fetch(`${API_BASE_URL}/api/players?search=${playerName}`)
        const data = await res.json()

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
        const data = await res.json()

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
          .setDescription(`Match submitted for approval`)
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

        await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        })
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
    await interaction.reply({
      content: 'An error occurred while processing your command.',
      ephemeral: true,
    })
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return

  if (interaction.customId === 'approve_match' || interaction.customId === 'reject_match') {
    await interaction.update({
      content: interaction.customId === 'approve_match'
        ? '✅ Match approved! Rankings will update shortly.'
        : '❌ Match rejected.',
      components: [],
    })
  }
})

client.login(DISCORD_BOT_TOKEN).catch(err => {
  console.error('[Discord] Failed to login:', err.message)
  console.log('[Discord] Bot will not be available. Set DISCORD_BOT_TOKEN in .env')
})

export { client }
