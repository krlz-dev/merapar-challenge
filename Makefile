# Makefile for LaTeX document compilation
DOCUMENT = dynamic-text-solution-report
TEX_FILE = $(DOCUMENT).tex
PDF_FILE = $(DOCUMENT).pdf

# LaTeX compiler
LATEX = pdflatex
LATEX_FLAGS = -interaction=nonstopmode -halt-on-error

# Default target
all: $(PDF_FILE)

# Compile the PDF
$(PDF_FILE): $(TEX_FILE)
	@echo "Compiling LaTeX document..."
	$(LATEX) $(LATEX_FLAGS) $(TEX_FILE)
	@echo "Running second pass for references..."
	$(LATEX) $(LATEX_FLAGS) $(TEX_FILE)
	@echo "PDF compilation complete: $(PDF_FILE)"

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	rm -f *.aux *.log *.toc *.out *.nav *.snm *.vrb *.fls *.fdb_latexmk *.synctex.gz

# Clean everything including PDF
clean-all: clean
	@echo "Removing PDF file..."
	rm -f $(PDF_FILE)

# View the PDF (if available)
view: $(PDF_FILE)
	@if command -v evince >/dev/null 2>&1; then \
		evince $(PDF_FILE) & \
	elif command -v okular >/dev/null 2>&1; then \
		okular $(PDF_FILE) & \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open $(PDF_FILE) & \
	else \
		echo "No PDF viewer found. Please open $(PDF_FILE) manually."; \
	fi

# Help target
help:
	@echo "Available targets:"
	@echo "  all       - Compile the LaTeX document to PDF"
	@echo "  clean     - Remove temporary LaTeX files"
	@echo "  clean-all - Remove all generated files including PDF"
	@echo "  view      - Open the PDF with default viewer"
	@echo "  help      - Show this help message"

.PHONY: all clean clean-all view help