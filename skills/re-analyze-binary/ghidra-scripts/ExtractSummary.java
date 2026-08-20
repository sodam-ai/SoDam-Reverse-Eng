// ExtractSummary.java -- SoDam-Reverse Ghidra headless post-script.
// Extracts a function list, defined strings, and imported (external) symbols
// as plain text, so the standard Korean report's function/string/import
// sections can be filled from real analysis output instead of guesses.
//
// Usage (headless):
//   support/analyzeHeadless.bat <projFolder> <projName> -import <file> ^
//     -postScript ExtractSummary.java <outputFilePath> ^
//     -scriptPath <this folder> -deleteProject
//
// NOTE: this project's Ghidra 12.1.3 headless install does not have PyGhidra
// wired in, so the classic Jython (.py) postScript path fails with
// "Ghidra was not started with PyGhidra. Python is not available"
// (found live, 2026-08-19). Java scripts are always supported by the
// headless analyzer, so this is the reliable path -- use this file, not a
// .py one, unless PyGhidra headless support is separately confirmed working.
//
// If no output path arg is given, prints to the script log instead.

import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.Data;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionManager;
import ghidra.program.model.listing.Listing;
import ghidra.program.model.symbol.Symbol;
import ghidra.program.model.symbol.SymbolTable;
import java.io.PrintWriter;
import java.util.Iterator;

public class ExtractSummary extends GhidraScript {

	@Override
	public void run() throws Exception {
		StringBuilder sb = new StringBuilder();

		sb.append("=== FUNCTIONS ===\n");
		FunctionManager fm = currentProgram.getFunctionManager();
		Iterator<Function> funcIter = fm.getFunctions(true);
		while (funcIter.hasNext()) {
			Function f = funcIter.next();
			sb.append(f.getName()).append(" @ ").append(f.getEntryPoint()).append("\n");
		}

		sb.append("\n=== STRINGS ===\n");
		Listing listing = currentProgram.getListing();
		Iterator<Data> dataIter = listing.getDefinedData(true);
		while (dataIter.hasNext()) {
			Data d = dataIter.next();
			if (d.hasStringValue()) {
				sb.append(d.getValue()).append("\n");
			}
		}

		sb.append("\n=== IMPORTS ===\n");
		SymbolTable st = currentProgram.getSymbolTable();
		Iterator<Symbol> extIter = st.getExternalSymbols();
		while (extIter.hasNext()) {
			Symbol s = extIter.next();
			sb.append(s.getName()).append("\n");
		}

		String[] args = getScriptArgs();
		if (args != null && args.length > 0) {
			PrintWriter pw = new PrintWriter(args[0]);
			try {
				pw.print(sb.toString());
			}
			finally {
				pw.close();
			}
			println("ExtractSummary.java: wrote output to " + args[0]);
		}
		else {
			println(sb.toString());
		}
	}
}
