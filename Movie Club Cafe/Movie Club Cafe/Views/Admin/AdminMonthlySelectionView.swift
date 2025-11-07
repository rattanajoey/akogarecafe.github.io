//
//  AdminMonthlySelectionView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/7/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct AdminMonthlySelectionView: View {
    @State private var pools: [Genre: [Movie]] = [.action: [], .drama: [], .comedy: [], .thriller: []]
    @State private var selections: [Genre: Movie] = [:]
    @State private var selectedMonth = getCurrentMonth()
    @State private var isLoading = false
    @State private var showSaveDialog = false
    @State private var savePassword = ""
    @State private var errorMessage = ""
    @State private var showError = false
    @State private var showSuccess = false
    @State private var successMessage = ""
    
    private var publishPassword: String { AppConfig.publishPassword }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("🎬 Monthly Movie Selection")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding()
                
                // Month selector
                monthSelectorSection
                
                // Genre pools display
                genrePoolsSection
                
                // Actions
                actionsSection
                
                // Selected movies preview
                if !selections.isEmpty {
                    selectedMoviesSection
                }
            }
            .padding()
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
        .sheet(isPresented: $showSaveDialog) {
            saveConfirmationSheet
        }
        .onAppear {
            loadPools()
        }
    }
    
    private var monthSelectorSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Select Month for Next Selection")
                .font(.headline)
            
            Picker("Month", selection: $selectedMonth) {
                ForEach(getMonthOptions(), id: \.value) { option in
                    Text(option.label).tag(option.value)
                }
            }
            .pickerStyle(.menu)
            .padding()
            .background(Color.white)
            .cornerRadius(10)
        }
    }
    
    private var genrePoolsSection: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Genre Pools")
                .font(.title2)
                .fontWeight(.bold)
            
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
            } else {
                ForEach(Genre.allCases, id: \.self) { genre in
                    GenrePoolCard(genre: genre, movies: pools[genre] ?? [])
                }
            }
        }
    }
    
    private var actionsSection: some View {
        VStack(spacing: 15) {
            Button(action: randomizeSelections) {
                Label("🎲 Randomize Selections", systemImage: "dice")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 77/255, green: 105/255, blue: 93/255))
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            
            Button(action: { showSaveDialog = true }) {
                Label("💾 Save to Firestore", systemImage: "square.and.arrow.down")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppTheme.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .disabled(selections.isEmpty)
        }
    }
    
    private var selectedMoviesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("🎉 Selected Movies")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(Genre.allCases, id: \.self) { genre in
                if let movie = selections[genre] {
                    HStack {
                        Text(genre.title + ":")
                            .fontWeight(.semibold)
                        Text(movie.title)
                        Text("—")
                            .foregroundColor(AppTheme.textSecondary)
                        Text(movie.submittedBy)
                            .italic()
                            .foregroundColor(AppTheme.textSecondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(8)
                }
            }
        }
    }
    
    private var saveConfirmationSheet: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Confirm Save")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Please enter the save password to confirm:")
                    .font(.body)
                    .foregroundColor(AppTheme.textSecondary)
                
                SecureField("Save Password", text: $savePassword)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)
                
                Button(action: confirmSave) {
                    Text("Confirm Save")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(AppTheme.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                
                Button(action: { showSaveDialog = false }) {
                    Text("Cancel")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
            }
            .padding()
        }
    }
    
    // MARK: - Firebase Operations
    
    private func loadPools() {
        #if canImport(FirebaseFirestore)
        isLoading = true
        let db = FirebaseConfig.shared.db
        let currentPoolRef = db.collection("GenrePools").document("current")
        
        Task {
            do {
                let document = try await currentPoolRef.getDocument()
                if document.exists {
                    let data = try document.data(as: GenrePools.self)
                    await MainActor.run {
                        pools = [
                            .action: data.action,
                            .drama: data.drama,
                            .comedy: data.comedy,
                            .thriller: data.thriller
                        ]
                        isLoading = false
                    }
                } else {
                    // Create from current submissions if no pool exists
                    await loadFromSubmissions()
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Error fetching pools: \(error.localizedDescription)"
                    showError = true
                    isLoading = false
                }
            }
        }
        #endif
    }
    
    #if canImport(FirebaseFirestore)
    private func loadFromSubmissions() async {
        let db = FirebaseConfig.shared.db
        let currentMonth = getCurrentMonth()
        let submissionsRef = db.collection("Submissions").document(currentMonth).collection("users")
        
        do {
            let snapshot = try await submissionsRef.getDocuments()
            var newPools: [Genre: [Movie]] = [.action: [], .drama: [], .comedy: [], .thriller: []]
            
            for document in snapshot.documents {
                let data = document.data()
                let nickname = document.documentID
                
                for genre in Genre.allCases {
                    if let title = data[genre.rawValue] as? String, !title.isEmpty {
                        newPools[genre]?.append(Movie(
                            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                            submittedBy: nickname
                        ))
                    }
                }
            }
            
            // Save the new pool
            let poolData = GenrePools(
                action: newPools[.action] ?? [],
                drama: newPools[.drama] ?? [],
                comedy: newPools[.comedy] ?? [],
                thriller: newPools[.thriller] ?? []
            )
            
            try await db.collection("GenrePools").document("current").setData(from: poolData)
            
            await MainActor.run {
                pools = newPools
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = "Error loading from submissions: \(error.localizedDescription)"
                showError = true
                isLoading = false
            }
        }
    }
    #endif
    
    private func randomizeSelections() {
        var result: [Genre: Movie] = [:]
        
        for genre in Genre.allCases {
            let options = pools[genre] ?? []
            if !options.isEmpty {
                // Cryptographically secure random selection
                let randomIndex = Int.random(in: 0..<options.count)
                result[genre] = options[randomIndex]
            }
        }
        
        selections = result
    }
    
    private func confirmSave() {
        guard savePassword == publishPassword else {
            errorMessage = "Incorrect password!"
            showError = true
            savePassword = ""
            return
        }
        
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                // Save monthly selections
                let monthlyData = MonthlySelections(
                    action: selections[.action],
                    drama: selections[.drama],
                    comedy: selections[.comedy],
                    thriller: selections[.thriller]
                )
                
                try await db.collection("MonthlySelections").document(selectedMonth).setData(from: monthlyData)
                
                // Update genre pools (remove selected movies)
                var updatedPools = pools
                for genre in Genre.allCases {
                    if let selected = selections[genre] {
                        updatedPools[genre]?.removeAll { $0.title == selected.title && $0.submittedBy == selected.submittedBy }
                    }
                }
                
                let poolData = GenrePools(
                    action: updatedPools[.action] ?? [],
                    drama: updatedPools[.drama] ?? [],
                    comedy: updatedPools[.comedy] ?? [],
                    thriller: updatedPools[.thriller] ?? []
                )
                
                try await db.collection("GenrePools").document("current").setData(from: poolData)
                
                await MainActor.run {
                    pools = updatedPools
                    successMessage = "Selections saved successfully!"
                    showSuccess = true
                    showSaveDialog = false
                    savePassword = ""
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to save selections: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
    
    private func getMonthOptions() -> [(value: String, label: String)] {
        var options: [(value: String, label: String)] = []
        let calendar = Calendar.current
        let now = Date()
        
        for i in 0...3 {
            if let date = calendar.date(byAdding: .month, value: i, to: now) {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM"
                let value = formatter.string(from: date)
                
                formatter.dateFormat = "MMMM yyyy"
                let label = formatter.string(from: date)
                
                options.append((value: value, label: label))
            }
        }
        
        return options
    }
}

#Preview {
    AdminMonthlySelectionView()
}

