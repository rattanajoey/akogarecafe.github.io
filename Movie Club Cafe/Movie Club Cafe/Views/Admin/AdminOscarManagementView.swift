//
//  AdminOscarManagementView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/7/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct AdminOscarManagementView: View {
    @State private var oscarCategories: [OscarCategory] = []
    @State private var oscarVotes: [OscarVote] = []
    @State private var allMovies: [String] = []
    @State private var newCategoryName = ""
    @State private var selectedCategoryId: String?
    @State private var selectedMovies: [String: [String]] = [:]
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showError = false
    @State private var successMessage = ""
    @State private var showSuccess = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Image(systemName: "trophy.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.yellow)
                    Text("🏆 Oscar Voting Admin")
                        .font(.title)
                        .fontWeight(.bold)
                }
                .padding()
                
                // Add new category section
                addCategorySection
                
                Divider()
                
                // Categories management
                categoriesSection
                
                Divider()
                
                // Votes review
                votesSection
            }
            .padding()
        }
        .onAppear {
            loadOscarData()
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .alert("Success", isPresented: $showSuccess) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(successMessage)
        }
    }
    
    private var addCategorySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Add New Category")
                .font(.headline)
            
            HStack {
                TextField("e.g., Best Picture, Best Director", text: $newCategoryName)
                    .textFieldStyle(.roundedBorder)
                
                Button(action: addCategory) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundColor(AppTheme.accentColor)
                }
                .disabled(newCategoryName.isEmpty)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
    }
    
    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Oscar Categories")
                .font(.title2)
                .fontWeight(.bold)
            
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
            } else if oscarCategories.isEmpty {
                Text("No categories yet. Add one above!")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                ForEach(oscarCategories, id: \.id) { category in
                    CategoryCard(
                        category: category,
                        allMovies: allMovies,
                        selectedMovies: Binding(
                            get: { selectedMovies[category.id] ?? [] },
                            set: { selectedMovies[category.id] = $0 }
                        ),
                        onSave: { saveCategoryMovies(categoryId: category.id) },
                        onDelete: { deleteCategory(category: category) }
                    )
                }
            }
        }
    }
    
    private var votesSection: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Oscar Votes (\(oscarVotes.count))")
                .font(.title2)
                .fontWeight(.bold)
            
            if oscarVotes.isEmpty {
                Text("No votes submitted yet")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            } else {
                ForEach(oscarVotes, id: \.voteId) { vote in
                    VoteCard(vote: vote, onDelete: { deleteVote(vote: vote) })
                }
            }
        }
    }
    
    // MARK: - Firebase Operations
    
    private func loadOscarData() {
        #if canImport(FirebaseFirestore)
        isLoading = true
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                // Load categories
                let categoriesSnapshot = try await db.collection("OscarCategories").getDocuments()
                let categories = try categoriesSnapshot.documents.compactMap { doc in
                    try doc.data(as: OscarCategory.self)
                }
                
                // Load votes
                let votesSnapshot = try await db.collection("OscarVotes").getDocuments()
                let votes = try votesSnapshot.documents.compactMap { doc in
                    try doc.data(as: OscarVote.self)
                }
                
                // Load all unique movies from all categories
                var movieSet = Set<String>()
                for category in categories {
                    movieSet.formUnion(category.movies)
                }
                
                await MainActor.run {
                    self.oscarCategories = categories
                    self.oscarVotes = votes
                    self.allMovies = Array(movieSet).sorted()
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to load Oscar data: \(error.localizedDescription)"
                    showError = true
                    isLoading = false
                }
            }
        }
        #endif
    }
    
    private func addCategory() {
        guard !newCategoryName.isEmpty else { return }
        
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        let categoryId = newCategoryName.lowercased().replacingOccurrences(of: " ", with: "-")
        
        let newCategory = OscarCategory(
            id: categoryId,
            name: newCategoryName,
            movies: []
        )
        
        Task {
            do {
                try db.collection("OscarCategories").document(categoryId).setData(from: newCategory)
                
                await MainActor.run {
                    oscarCategories.append(newCategory)
                    newCategoryName = ""
                    successMessage = "Category added successfully!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to add category: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
    
    private func deleteCategory(category: OscarCategory) {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                try await db.collection("OscarCategories").document(category.id).delete()
                
                await MainActor.run {
                    oscarCategories.removeAll { $0.id == category.id }
                    successMessage = "Category deleted successfully!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to delete category: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
    
    private func saveCategoryMovies(categoryId: String) {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        let movies = selectedMovies[categoryId] ?? []
        
        Task {
            do {
                try await db.collection("OscarCategories").document(categoryId).updateData([
                    "movies": movies
                ])
                
                await MainActor.run {
                    if let index = oscarCategories.firstIndex(where: { $0.id == categoryId }) {
                        oscarCategories[index].movies = movies
                    }
                    selectedMovies[categoryId] = []
                    successMessage = "Movies saved successfully!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to save movies: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
    
    private func deleteVote(vote: OscarVote) {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                try await db.collection("OscarVotes").document(vote.voteId).delete()
                
                await MainActor.run {
                    oscarVotes.removeAll { $0.voteId == vote.voteId }
                    successMessage = "Vote deleted successfully!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to delete vote: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
}

// MARK: - Supporting Views

struct CategoryCard: View {
    let category: OscarCategory
    let allMovies: [String]
    @Binding var selectedMovies: [String]
    let onSave: () -> Void
    let onDelete: () -> Void
    
    @State private var isExpanded = false
    @State private var showDeleteConfirmation = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(category.name)
                    .font(.headline)
                
                Spacer()
                
                Text("\(category.movies.count) movies")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Button(action: { showDeleteConfirmation = true }) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
                
                Button(action: { isExpanded.toggle() }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(AppTheme.accentColor)
                }
            }
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Current nominees:")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    if category.movies.isEmpty {
                        Text("No movies nominated yet")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(category.movies, id: \.self) { movie in
                            Text("• \(movie)")
                                .font(.caption)
                        }
                    }
                    
                    Divider()
                    
                    Text("Select movies to nominate:")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(allMovies, id: \.self) { movie in
                                MovieChip(
                                    movie: movie,
                                    isSelected: selectedMovies.contains(movie),
                                    onToggle: { toggleMovie(movie) }
                                )
                            }
                        }
                    }
                    
                    if !selectedMovies.isEmpty {
                        Button(action: onSave) {
                            Text("Save \(selectedMovies.count) Movie(s)")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
        .confirmationDialog("Delete Category", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive, action: onDelete)
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to delete \"\(category.name)\"?")
        }
    }
    
    private func toggleMovie(_ movie: String) {
        if let index = selectedMovies.firstIndex(of: movie) {
            selectedMovies.remove(at: index)
        } else {
            selectedMovies.append(movie)
        }
    }
}

struct MovieChip: View {
    let movie: String
    let isSelected: Bool
    let onToggle: () -> Void
    
    var body: some View {
        Button(action: onToggle) {
            Text(movie)
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? AppTheme.accentColor : Color.gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(15)
        }
    }
}

struct VoteCard: View {
    let vote: OscarVote
    let onDelete: () -> Void
    
    @State private var showDeleteConfirmation = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Image(systemName: "person.fill")
                    .foregroundColor(AppTheme.accentColor)
                Text(vote.voterName)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Button(action: { showDeleteConfirmation = true }) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
            }
            
            ForEach(Array(vote.votes.keys.sorted()), id: \.self) { categoryId in
                if let movie = vote.votes[categoryId] {
                    HStack {
                        Text(categoryId)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("→")
                            .foregroundColor(.secondary)
                        Text(movie)
                            .font(.caption)
                    }
                }
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
        .confirmationDialog("Delete Vote", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive, action: onDelete)
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to delete \(vote.voterName)'s vote?")
        }
    }
}

#Preview {
    AdminOscarManagementView()
}

