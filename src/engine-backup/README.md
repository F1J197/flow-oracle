# Engine Backup

This directory contains a complete backup of all engine implementation code from `src/engines/` as of the backup creation date.

## Purpose

This backup preserves our complex engine calculations and implementations while we fix the foundation system. The code in this directory represents the working state of all engines before foundation refactoring.

## Structure

This backup contains all files and subdirectories from the original `src/engines/` directory:

- **Base engines**: BaseEngine.ts, ResilientBaseEngine.ts
- **Engine management**: EngineRegistry.ts, EngineOrchestrator.ts, EngineInitializer.ts
- **Specific engines**: All implemented engines (CUSIPStealthQEEngine, CreditStressEngineV6, etc.)
- **Foundation engines**: Complete foundation directory structure
- **Pillar engines**: All pillar-based engine implementations
- **Base classes**: All base engine classes and orchestrators
- **Utilities**: Helper functions and shared utilities

## Important Notes

1. **Preserve calculations**: The mathematical implementations and calculation logic in these files should be preserved
2. **Reference only**: This backup is for reference and preservation - do not run these files directly
3. **Foundation fixing**: Once the foundation is fixed, logic from these files can be ported back
4. **Version control**: This represents a snapshot in time of the engine system

## Next Steps

1. Fix the foundation system compatibility issues
2. Create new engine structure with proper theme/type compatibility  
3. Port calculation logic from backup files to new structure
4. Test and validate all engines work with new foundation

## Backup Created

Date: $(date)
Source: src/engines/
Purpose: Preserve engine implementations during foundation fixes