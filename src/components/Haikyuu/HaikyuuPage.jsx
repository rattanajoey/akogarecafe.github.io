import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Star as StarIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  SportsVolleyball as VolleyballIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import { haikyuuCharacters } from "./haikyuuData";

const HaikyuuPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [playerTypeFilter, setPlayerTypeFilter] = useState("all");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("rarity"); // 'rarity', 'position', 'school', 'playerType', 'totalStats'

  // Get unique values for filters
  const schools = useMemo(() => {
    const uniqueSchools = [
      ...new Set(haikyuuCharacters.map((char) => char.school)),
    ];
    return uniqueSchools.sort();
  }, []);

  const positions = useMemo(() => {
    const uniquePositions = [
      ...new Set(haikyuuCharacters.map((char) => char.position)),
    ];
    return uniquePositions.sort();
  }, []);

  const playerTypes = useMemo(() => {
    const uniqueTypes = [
      ...new Set(haikyuuCharacters.map((char) => char.playerType)),
    ];
    return uniqueTypes.sort();
  }, []);

  // Filter and sort characters
  const filteredCharacters = useMemo(() => {
    let filtered = haikyuuCharacters.filter((character) => {
      const matchesSearch =
        character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.school.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity =
        rarityFilter === "all" || character.rarity === rarityFilter;
      const matchesPosition =
        positionFilter === "all" || character.position === positionFilter;
      const matchesSchool =
        schoolFilter === "all" || character.school === schoolFilter;
      const matchesPlayerType =
        playerTypeFilter === "all" || character.playerType === playerTypeFilter;

      return (
        matchesSearch &&
        matchesRarity &&
        matchesPosition &&
        matchesSchool &&
        matchesPlayerType
      );
    });

    // Sort characters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rarity":
          const rarityOrder = { SSR: 3, SR: 2, R: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case "position":
          return a.position.localeCompare(b.position);
        case "school":
          return a.school.localeCompare(b.school);
        case "playerType":
          return a.playerType.localeCompare(b.playerType);
        case "totalStats":
          const aTotal = getTotalStats(a);
          const bTotal = getTotalStats(b);
          return bTotal - aTotal;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    searchTerm,
    rarityFilter,
    positionFilter,
    schoolFilter,
    playerTypeFilter,
    sortBy,
  ]);

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCharacter(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRarityFilter("all");
    setPositionFilter("all");
    setSchoolFilter("all");
    setPlayerTypeFilter("all");
    setSortBy("rarity");
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "SSR":
        return "#FFD700";
      case "SR":
        return "#C0C0C0";
      case "R":
        return "#CD7F32";
      default:
        return "#666";
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case "Setter":
        return "#4CAF50";
      case "Wing Spiker":
        return "#2196F3";
      case "Middle Blocker":
        return "#FF9800";
      case "Libero":
        return "#9C27B0";
      case "Opposite Hitter":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getPlayerTypeColor = (playerType) => {
    switch (playerType) {
      case "Quick Attack Type":
        return "#E91E63";
      case "Blocking Specialist":
        return "#795548";
      case "Setter Specialist":
        return "#009688";
      case "Defensive Specialist":
        return "#673AB7";
      default:
        return "#666";
    }
  };

  const getTotalStats = (character) => {
    const attackTotal = Object.values(character.basicAttack).reduce(
      (sum, val) => sum + val,
      0
    );
    const defenseTotal = Object.values(character.basicDefense).reduce(
      (sum, val) => sum + val,
      0
    );
    return attackTotal + defenseTotal;
  };

  const getTopStat = (character) => {
    const allStats = { ...character.basicAttack, ...character.basicDefense };
    const maxStat = Math.max(...Object.values(allStats));
    const statName = Object.keys(allStats).find(
      (key) => allStats[key] === maxStat
    );
    return { name: statName, value: maxStat };
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h3" sx={{ color: "#333", mb: 1 }}>
          Haikyuu Fly High
        </Typography>
        <Typography variant="h6" sx={{ color: "#666" }}>
          Character Database & Build Guide
        </Typography>
        <Typography variant="body2" sx={{ color: "#888", mt: 1 }}>
          {filteredCharacters.length} characters available
        </Typography>
      </Box>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={viewMode}
          onChange={(e, newValue) => setViewMode(newValue)}
          centered
        >
          <Tab label="Grid View" value="grid" />
          <Tab label="List View" value="list" />
        </Tabs>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Rarity</InputLabel>
              <Select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                label="Rarity"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="SSR">SSR</MenuItem>
                <MenuItem value="SR">SR</MenuItem>
                <MenuItem value="R">R</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Position</InputLabel>
              <Select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                label="Position"
              >
                <MenuItem value="all">All</MenuItem>
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>School</InputLabel>
              <Select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                label="School"
              >
                <MenuItem value="all">All</MenuItem>
                {schools.map((school) => (
                  <MenuItem key={school} value={school}>
                    {school}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={playerTypeFilter}
                onChange={(e) => setPlayerTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All</MenuItem>
                {playerTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="rarity">Rarity</MenuItem>
                <MenuItem value="position">Position</MenuItem>
                <MenuItem value="school">School</MenuItem>
                <MenuItem value="playerType">Player Type</MenuItem>
                <MenuItem value="totalStats">Total Stats</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={resetFilters}
              sx={{ minWidth: "auto" }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {/* Filter Summary */}
        {(searchTerm ||
          rarityFilter !== "all" ||
          positionFilter !== "all" ||
          schoolFilter !== "all" ||
          playerTypeFilter !== "all") && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
              Active Filters:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {searchTerm && (
                <Chip
                  label={`Search: "${searchTerm}"`}
                  size="small"
                  onDelete={() => setSearchTerm("")}
                  sx={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                />
              )}
              {rarityFilter !== "all" && (
                <Chip
                  label={`Rarity: ${rarityFilter}`}
                  size="small"
                  onDelete={() => setRarityFilter("all")}
                  sx={{ backgroundColor: "#fff3e0", color: "#e65100" }}
                />
              )}
              {positionFilter !== "all" && (
                <Chip
                  label={`Position: ${positionFilter}`}
                  size="small"
                  onDelete={() => setPositionFilter("all")}
                  sx={{ backgroundColor: "#e8f5e8", color: "#2e7d32" }}
                />
              )}
              {schoolFilter !== "all" && (
                <Chip
                  label={`School: ${schoolFilter}`}
                  size="small"
                  onDelete={() => setSchoolFilter("all")}
                  sx={{ backgroundColor: "#f3e5f5", color: "#7b1fa2" }}
                />
              )}
              {playerTypeFilter !== "all" && (
                <Chip
                  label={`Type: ${playerTypeFilter}`}
                  size="small"
                  onDelete={() => setPlayerTypeFilter("all")}
                  sx={{ backgroundColor: "#fff8e1", color: "#f57c00" }}
                />
              )}
            </Box>
          </Box>
        )}
      </Card>

      {/* Characters Display */}
      {viewMode === "grid" ? (
        <Grid container spacing={2}>
          {filteredCharacters.map((character) => {
            const topStat = getTopStat(character);
            const totalStats = getTotalStats(character);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={character.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                    transition: "all 0.2s",
                  }}
                  onClick={() => handleCharacterClick(character)}
                >
                  <CardContent sx={{ p: 2 }}>
                    {/* Header with Name and Rarity */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", flex: 1, mr: 1 }}
                      >
                        {character.name}
                      </Typography>
                      <Chip
                        label={character.rarity}
                        size="small"
                        sx={{
                          backgroundColor: getRarityColor(character.rarity),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    {/* School and Position */}
                    <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
                      {character.school}
                    </Typography>

                    <Box
                      sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}
                    >
                      <Chip
                        label={character.position}
                        size="small"
                        sx={{
                          backgroundColor: getPositionColor(character.position),
                          color: "white",
                        }}
                      />
                      <Chip
                        label={character.playerType}
                        size="small"
                        sx={{
                          backgroundColor: getPlayerTypeColor(
                            character.playerType
                          ),
                          color: "white",
                        }}
                      />
                    </Box>

                    {/* Top Stat Highlight */}
                    <Box
                      sx={{
                        mb: 1,
                        p: 1,
                        backgroundColor: "#f0f8ff",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#1976d2", fontWeight: "bold" }}
                      >
                        Top Stat:{" "}
                        {topStat.name.replace(/([A-Z])/g, " $1").trim()} (
                        {topStat.value})
                      </Typography>
                    </Box>

                    {/* Quick Stats Summary */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "gray" }}>
                        Total: {totalStats.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "gray" }}>
                        Potential: {character.potential.slots} slots
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box>
          {filteredCharacters.map((character) => {
            const totalStats = getTotalStats(character);

            return (
              <Card
                key={character.id}
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
                onClick={() => handleCharacterClick(character)}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} md={2.5}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={character.rarity}
                          size="small"
                          sx={{
                            backgroundColor: getRarityColor(character.rarity),
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {character.name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="body2" sx={{ color: "gray" }}>
                        {character.school}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <Chip
                        label={character.position}
                        size="small"
                        sx={{
                          backgroundColor: getPositionColor(character.position),
                          color: "white",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Chip
                        label={character.playerType}
                        size="small"
                        sx={{
                          backgroundColor: getPlayerTypeColor(
                            character.playerType
                          ),
                          color: "white",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="body2">
                        Stats: {totalStats.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="body2" sx={{ color: "gray" }}>
                        Potential: {character.potential.slots}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                      <Typography variant="body2" sx={{ color: "gray" }}>
                        Memories: {character.memories.count}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Character Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        {selectedCharacter && (
          <>
            <DialogTitle sx={{ backgroundColor: "#f5f5f5" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {selectedCharacter.name}
                </Typography>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Left Column - Basic Info */}
                <Grid item xs={12} md={4}>
                  {/* Character Info */}
                  <Card sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
                      Character Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="School"
                          secondary={selectedCharacter.school}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Position"
                          secondary={selectedCharacter.position}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <VolleyballIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Player Type"
                          secondary={selectedCharacter.playerType}
                        />
                      </ListItem>
                    </List>

                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={selectedCharacter.rarity}
                        sx={{
                          backgroundColor: getRarityColor(
                            selectedCharacter.rarity
                          ),
                          color: "white",
                          fontWeight: "bold",
                          mb: 1,
                        }}
                      />
                    </Box>
                  </Card>

                  {/* Description */}
                  <Card sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
                      Description
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", lineHeight: 1.6 }}
                    >
                      {selectedCharacter.description}
                    </Typography>
                  </Card>

                  {/* Gameplay Tips */}
                  <Card sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
                      Gameplay Tips
                    </Typography>
                    <List dense>
                      {selectedCharacter.gameplayTips.map((tip, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon>
                            <StarIcon sx={{ color: "#FFD700", fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText primary={tip} />
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </Grid>

                {/* Right Column - Stats and Details */}
                <Grid item xs={12} md={8}>
                  {/* Stats Section */}
                  <Card sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
                      Character Stats
                    </Typography>

                    {/* Basic Attack Stats */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#d32f2f" }}
                      >
                        Basic Attack Stats
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(selectedCharacter.basicAttack).map(
                          ([stat, value]) => (
                            <Grid item xs={6} key={stat}>
                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textTransform: "capitalize",
                                    mb: 0.5,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {stat.replace(/([A-Z])/g, " $1").trim()}
                                </Typography>
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 20,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${(value / 700) * 100}%`,
                                      height: "100%",
                                      backgroundColor: "#d32f2f",
                                      transition: "width 0.5s ease",
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "gray" }}
                                >
                                  {value}
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>

                    {/* Bonus Attack Stats */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#f57c00" }}
                      >
                        Bonus Attack Stats
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(selectedCharacter.bonusAttack).map(
                          ([stat, value]) => (
                            <Grid item xs={4} key={stat}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 1,
                                  backgroundColor: "#fff3e0",
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textTransform: "capitalize",
                                    mb: 0.5,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {stat.replace(/([A-Z])/g, " $1").trim()}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{ color: "#f57c00" }}
                                >
                                  {value}%
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>

                    {/* Basic Defense Stats */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}
                      >
                        Basic Defense Stats
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(selectedCharacter.basicDefense).map(
                          ([stat, value]) => (
                            <Grid item xs={4} key={stat}>
                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textTransform: "capitalize",
                                    mb: 0.5,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {stat.replace(/([A-Z])/g, " $1").trim()}
                                </Typography>
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 20,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${(value / 700) * 100}%`,
                                      height: "100%",
                                      backgroundColor: "#1976d2",
                                      transition: "width 0.5s ease",
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "gray" }}
                                >
                                  {value}
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>

                    {/* Bonus Defense Stats */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#7b1fa2" }}
                      >
                        Bonus Defense Stats
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(selectedCharacter.bonusDefense).map(
                          ([stat, value]) => (
                            <Grid item xs={4} key={stat}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 1,
                                  backgroundColor: "#f3e5f5",
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textTransform: "capitalize",
                                    mb: 0.5,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {stat.replace(/([A-Z])/g, " $1").trim()}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{ color: "#7b1fa2" }}
                                >
                                  {value}%
                                </Typography>
                              </Box>
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Box>
                  </Card>

                  {/* Build Section */}
                  <Card sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#333" }}>
                      Build & Recommendations
                    </Typography>

                    {/* Potential System */}
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          Potential System ({selectedCharacter.potential.slots}{" "}
                          slots)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", mb: 1 }}
                          >
                            Recommended Stats:
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            {selectedCharacter.potential.recommended.map(
                              (stat, index) => (
                                <Chip
                                  key={index}
                                  label={stat.replace(/([A-Z])/g, " $1").trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#e8f5e8",
                                    color: "#2e7d32",
                                  }}
                                />
                              )
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", mb: 1 }}
                          >
                            Recommended Sets:
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {selectedCharacter.potential.recommendedSets.map(
                              (set, index) => (
                                <Chip
                                  key={index}
                                  label={set.replace(/([A-Z])/g, " $1").trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#fff3e0",
                                    color: "#e65100",
                                  }}
                                />
                              )
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    {/* Memory System */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          Memory System ({selectedCharacter.memories.count}{" "}
                          memory)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {selectedCharacter.memories.recommended.map(
                            (memory, index) => (
                              <Chip
                                key={index}
                                label={memory}
                                size="small"
                                sx={{
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                }}
                              />
                            )
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    {/* Bond System */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          Bond System ({selectedCharacter.bonds.length} bonds)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {selectedCharacter.bonds.map((bond, index) => (
                            <ListItem key={index} sx={{ py: 1 }}>
                              <ListItemIcon>
                                <PsychologyIcon sx={{ color: "#9c27b0" }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={bond.name}
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#666", mb: 0.5 }}
                                    >
                                      {bond.description}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {bond.characters.map(
                                        (char, charIndex) => (
                                          <Chip
                                            key={charIndex}
                                            label={char}
                                            size="small"
                                            sx={{
                                              backgroundColor: "#f3e5f5",
                                              color: "#7b1fa2",
                                            }}
                                          />
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* Recommended Lineup */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          Recommended Lineup
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {selectedCharacter.recommendedLineup.map(
                            (member, index) => (
                              <Grid item xs={6} sm={3} key={index}>
                                <Box
                                  sx={{
                                    textAlign: "center",
                                    p: 1,
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold", mb: 0.5 }}
                                  >
                                    {member.name}
                                  </Typography>
                                  <Chip
                                    label={member.rarity}
                                    size="small"
                                    sx={{
                                      backgroundColor: getRarityColor(
                                        member.rarity
                                      ),
                                      color: "white",
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Box>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
              <Button onClick={handleCloseDialog} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HaikyuuPage;
